# Cookbook

This section outlines how to implement various new features on both the frontend and the backend.

## HA/Load Balanced Backend

### Backend

Making the backend highly available and load balanced is relatively straightforward. At a high level, you will need to move all in-memory state (i.e., caches, the list of heartbeating nodes, etc.) into some centralized caching service and deploy a set of stateless ‘read only’ nodes behind a load balancer alongside a single Chainsaw/materializer node inaccessible to the public internet.

The following steps outline the general process:

1. Implement a CacheService that writes the cache to some caching service such as Redis or Elasticache.
2. Modify the dependency injection container to use the new CacheService as opposed to the in-memory one.
3. Modify the NodeStatusService to read and write the list of heartbeating nodes to the cache as opposed to the local process’s memory.
4. Deploy a set of backend processes behind a load balancer such as an ELB. Ensure that these processes have the IS_MASTER environment variable set to false. IS_MASTER controls whether or not materialization or Chainsaw will run. There only needs to be one Chainsaw per cluster and it does not need to be Internet-accessible.
5. Deploy a single IS_MASTER=true process. This process will materialize stats and run Chainsaw. HA can be achieved for this process by simply maintaining a backup instance that gets started if the primary crashes.
6. Instruct go-filecoin operators to heartbeat to the IP address or DNS record exposed by the ELB.

## Changing go-filecoin’s API

### Backend

The complexity of migrating the dashboard to use a new go-filecoin API depends on what the new API supports. If the new API is effectively a drop-in replacement for an existing API call, the process is trivial since the logic to access go-filecoin data is abstracted away behind interfaces. For example, to change the pledge API to use something new use the following process:

1. Create a new IMinerClient implementation.
2. Inject the new implementation as opposed to the old one.

Adding a new API endpoint is similar, except you would need to create a client interface as well as its implementation.

The above process holds true as long as it is possible for the new API to fully implement the existing set of client interfaces. If this changes - for example, if the backend can no longer rely upon Chainsaw to ingest the necessary data - more involved refactoring may be required. The general data access pattern remains the same, however: write up a client interface, implement it, and inject the implementation into the necessary services.

## Adding A New Stat

Adding a new stat requires changes to the frontend, backend, and common library. For this recipe, we will add a hypothetical “retrieval bid” stat for the sake of realism.

First, we must determine how we will calculate our stat. For the purposes of this document, we will assume that retrieval bids will appear on chain as a “retrievalBid” message that takes a single ABI-encoded “fileID” field of type Bytes. We will say that the amount of the bid is encoded in the message’s “value” field.

### Common

First, we will define the API the backend will generate and the frontend will consume. In common/src/domain/Stats.ts, add a new field to the Stats interface called “retrieval” of type RetrievalStats. Then, define the RetrievalStats interface with a single field called “retrievalBids” of type TimeseriesDatapoint[]. At this point, we have defined a new stat type called “retrieval” that contains a list of retrieval bids by time and value.

Next, implement the retrievalStatsToJSON and retrievalStatsFromJSON methods by following the patterns outlined elsewhere in the Stats.ts file.

We have now defined our API.

### Backend

Since this stat is parsing a new blockchain message, we’ll need to start by adding a new methodDecoder to ABI.ts. Open ABI.ts, and add the retrievalBid method to the map. Look at the other method definitions to determine how to use the ABIDecoder class to decode the value. This will allow Chainsaw to decode the retrievalBid’s ABI parameters, and persist them for us to use later.

Next, we will add our new DAO. Create a new file, in backend/src/service/dao, called RetrievalStatsDAO. In this file, define an interface called RetrievalStatsDAO with two methods:

- getStats(): Promise<RetrievalStats>
- getHistoricalRetrievalBids(dur: ChartDuration): Promise<TimeseriesDatapoint[]>

The first method, getStats(), returns the data we need to populate the sync API later. The second method, getHistoricalRetrievalBids(dur: ChartDuration), returns the retrieval bids for the specified time window. This is used to populate overrides in the frontend, and is called by getStats() with a month-long duration to get the initial stats returns by the sync API.

Now, define the PostgresStorageStatsDAO class, which implements the DAO we just defined above. This DAO will need to take the PGCient and ICacheService as constructor parameters, as we’d like to:

1. Make a database query, and
2. Cache responses.

We can now implement getHistoricalRetrievalBids. Take a look at getHistoricalCollateralPerGB in StorageStatsDAO - the patterns used there will be similar to what we will use to get hour historical retrieval stats. Specifically, we’ll be crafting a database query that uses the result of generateDurationSeries to create a sequence that, when joined with our query, will return us the average retrievalBid within each time frame within the sequence. The query will look something like this:

```sql
with d as (${durSeq}),
           m as (select avg(m.value)                                                       as amount,
                        extract(epoch from date_trunc('${durBase}', to_timestamp(b.ingested_at))) as date
                 from unique_messages m
                        join blocks b on m.tipset_hash = b.tipset_hash
                 where m.method = 'retrievalBid'
                 group by date)
      select d.date as date, coalesce(amount, 0))      from d
             left outer join m on d.date = m.date
      order by date asc;
```

Here’s what’s happening here:

We create a common table expression to hold our duration. `${durSeq}` contains a SQL fragment that generates the duration sequence for us.
We group all retrievalBid messages by truncated date, and select the average value during the group. This gives us an individual data point.
We join together our sequence and our data points.
We order by ascending date.

Take a look at the other DAO implementations if you get stuck; they all follow a similar pattern for historical data.

Let’s move on to getStats(). This method is simple - it returns the RetrievalStats object we defined earlier. Take a look at the getStats() implementations in other DAOs - you’ll see that we use the wrapMethod() function on the cache service to cache the results. You’ll want to do this here as well.

Moving on, we need to modify the SyncAPI class to return the results of our getStats call. To do this, we’ll need to add our new DAO as a constructor argument to SyncAPI, and inject that constructor arg in registry.ts through the IoC container. Once you’ve done this, add the new retrieval field to the returns stats object, and call the toJSON method we defined in the Common section.

To support switching between different timeframes on the chart, our last step will be to modify StatsAPI to return our retrieval stats given a duration. This starts off similarly to the above: inject the new DAO, and modify the registry. In this case, however, we’ll need to define a new method - call it historicalRetrievalBids - and expose that by adding a new URL to the GET map inside of StatsAPI.

At this point, we have created a new stat on the backend. Now, let’s create the frontend components required to render it.

### Frontend

Luckily, since we defined our interfaces in the common package no Redux store changes are necessary. We can focus entirely on rendering the retrieval bids chart.

For the sake of this tutorial, let’s say that we’ll be rendering this chart on the Retrieval Network Overview page. To render the chart, we’ll need to:

Define a new connected component, “RetrievalBidsChart,” that consumes the stats.retrieval.retrievalBids state key.
Render a DateSwitchingChart whose content is a TimelineDateChart. See HistoricalUtilizationChart.tsx for an example.
Wire up the setOverride method in mapDispatchToProps.
Render the RetrievalBidsChart component on the Retrieval page.

That’s all.