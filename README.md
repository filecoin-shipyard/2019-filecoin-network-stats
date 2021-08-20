# filecoin-network-stats

Dashboard built by Kyokan for tracking network state of the **go-filecoin** devnets in 2019.

## Status

This repository is in a **frozen** state. It is not being maintained or kept in sync with the libraries it depends on. This library was designed for an early version of _go-filecoin_, which is now known as [Venus](https://venus.filecoin.io/). An API client for Lotus can be found at https://github.com/filecoin-shipyard/js-lotus-client-rpc that may be used to build similar functionality. Even though this work on this repository has been **shelved**, anyone interested in updating or maintaining this library should express their interest on one Filecoin community conversation mediums: <https://github.com/filecoin-project/community#join-the-community>.

---

## Screenshots

![go-filecoin-network-stats-overview](images/go-filecoin-network-stats-dash-overview.jpg)

![go-filecoin-network-stats-evolution](images/go-filecoin-network-stats-dash-evolution.jpg)

## About

`filecoin-network-stats` is a visual interface for tracking the state of the Filecoin network. This repository contains two sub projects: the dashboard itself (located in `frontend`), and a stat collection server (located in `backend`).

**By default, all stats on the frontend are cached for 1 minute unless otherwise noted.** The stats collection server waits 4 blocks before considering a block to be 'finalized,' and so will appear to be behind the tip of the chain.

## Frontend

The `filecoin-network-stats` frontend is a React/Redux application written in Typescript. It uses [AmCharts4](https://www.amcharts.com) as its charting library. To start the frontend, run the following commands from within the `frontend` directory:

```bash
npm install
npm run dev
```

`npm run dev` will point the frontend to a local backend running on port 8081. To point to a different backend, run the following command instead:

```bash
BACKEND_URL=<your-backend-url> webpack-dev-server --hot
```

The dashboard updates itself via a polling loop that hits the backend's `/sync` endpoint every 5 seconds. This was chosen over WebSockets due to simplicity, and how it allows non-browser clients to query the backend's data as well without having to open a persistent connection.

### A note on the debug dependency

`debug` leaks memory when new instances are called in a loop. Since numerous transitive dependencies of this project do that, the `postinstall` script replaces `debug` with a no-op version.

## Backend

The app's backend is a Node.js application written in Typescript. It talks to a Postgres database and a local `go-filecoin` full node. The backend will by default listen for heartbeats on port 8080, and incoming API requests on port 8081. To get started running the backend, start by installing dependencies and compiling the application:

```
cd backend
npm i
npm run build
```

To start the backend, first create a `.env` file with the following environment variables in the `backend` directory:

```
export DB_URL=<your-postgres-url>
export FULL_NODE_URL=<your-full-node-url>
export IS_MASTER=true
export PEER_INFO_FILE=./peerId.json
export HEARTBEAT_PORT=8080
export API_PORT=8081
export LOG_LEVEL=info
```

Then, create a `peerId.json` by running the following command from your `backend` directory:

```bash
node -e "require('peer-id').create({ bits: 1024 }, (err, id) => { if (err) { throw err; } console.log(JSON.stringify(id.toJSON(), null, 2))})" > peerId.json
```

The above steps only need to be performed on fresh installations. Next, you'll need to migrate the database via the following command:

```bash
DATABASE_URL=<your database url> db-migrate up
```

Note that the migration command might take a while; it needs to import ~2MM IP-to-location records. See the IP data [README file](./backend/migrations/ip_data/README.md) for more information.

Now you're ready to start your node:

```bash
source ./.env && node ./dist/src/main.js
```

That's it! You're off to the races. To collect statistics on node counts and locations, ask miners to set their node's `heartbeatUrl` and `nickname`, like this:

```bash
go-filecoin config heartbeat.nickname '"Pizzanode"'
go-filecoin config heartbeat.beatTarget "/dns4/<your-backend-domain-name>/tcp/8080/ipfs/<your-peer-id>"
```

### REST API

The backend exposes a REST API for some stats:

| Endpoint                                                                | Description                                                                 |
|-------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| /stats/storage/historicalMinerCounts/:duration((all\|24h\|1w\|1m\|1y))      | Returns the number of heartbeating miners over time.                        |
| /stats/storage/historicalStoragePrice/:duration((all\|24h\|1w\|1m\|1y))     | Returns the average price of storage (in FIL) over time.                    |
| /stats/storage/historicalCollateral/:duration((all\|24h\|1w\|1m\|1y))       | Returns the amount of total pledged storage collateral (in FIL) over time.  |
| /stats/storage/historicalCollateralPerGB/:duration((all\|24h\|1w\|1m\|1y))  | Returns the amount of pledged storage collateral per GB (in FIL) over time. |
| /stats/storage/historicalStorageAmount/:duration((all\|24h\|1w\|1m\|1y))    | Returns the historical amount of network storage (in GB) over time.         |
| /stats/storage/historicalUtilization/:duration((all\|24h\|1w\|1m\|1y))      | Returns historical network utilization (as a %) over time.                  |
| /stats/token/historicalBlockRewards/:duration((all\|24h\|1w\|1m\|1y))       | Returns the historical block rewards (in FIL) over time.                    |
| /stats/token/historicalCoinsInCirculation/:duration((all\|24h\|1w\|1m\|1y)) | Returns the number of coins in circulation over time.                       |

The dashboard uses these to populate historical graphs when the user toggles between timeframes. You can also make a GET request to `/sync` to retrieve all of the stats that the dashboard uses to update itself.

### more info

For more information about the backend, check out [docs/backend.md](./docs/backend.md).

## a note about local development

You may find it easier to `npm link` the `filecoin-network-stats-common` dependency if you're actively developing. To do so, run these commands from the root of the repo:

```bash
cd common
npm run build
npm link
cd ../frontend
npm link filecoin-network-stats-common
cd ../backend
npm link filecoin-network-stats-common
```

Then, run `npm run build` from the `common` directory whenever you make changes to common dependencies. This prevents you from having to re-run `npm install` every time you change something in `common`.

# handoff

You can find additional notes on the Kyokan/Filecoin handoff in the [handoff](./docs/handoff) folder.
