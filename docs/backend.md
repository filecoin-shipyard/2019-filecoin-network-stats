# backend

This document explains the backend's architecture in a bit more detail. Unless you're actively developing new features for the backend, you likely won't need much of the information in here.

## services and dependency injection

The backend uses dependency injection to create instances of "service objects." Services are essentially singleton classes that provide functionality to one or more other services. Services and their dependencies are defined in the `registry.ts` file. Each call to `registry.bind` includes the service's name, a factory function to create the service, and an array of dependencies that the services needs to be injected. The registry and the dependency injection container itself live in `Container.ts` - they aren't external NPM modules.

## data access objects (DAOs)

Access to the backend's database is hidden behind a set of DAO interfaces. DAOs get injected into dependent services using the dependency injection container described above. Currently each DAO has only one concrete implementation that talks to Postgres. In the future, however, additional databases or persistence layers might be supported, so we hide the details of the persistence layer behind a DAO interface. All DAOs live in `src/service/dao`.

## api services

Services that expose an API endpoint extend the `IAPIService` interface, and have a corresponding entry in the `APIServices` dependency in `registry.ts`. API service expose a `namespace` property, which is used to build the root URL at which the service is mounted. They also expose `GET` and `POST` objects that define which URLs and HTTP methods specific handler methods will respond to. When the application starts, all API services will be automatically mounted at the routes they define and served via Express. Check out `src/service/api/StatsAPI.ts` for an example of a full API service, and `src/service/APIServer.ts` for the code that mounts each service within Express.

## go-filecoin client classes

`go-filecoin` uses [go-ipfs-cmds](https://github.com/ipfs/go-ipfs-cmds), which doesn't have a JavaScript implementation. To get around this, we implemented a barebones client compatible with `go-ipfs-cmds`'s HTTP API in `src/client/HTTPClient.ts`. Responses must be manually decoded.

## go-filecoin ABI classes

Similar to the above, there is no JavaScript implementation of the `go-filecoin` ABI. We need to parse the ABI when we consume blockchain messages in order to extract meaningful data from each message's `data` field. `src/client/ABI.ts` contains this implementation. We map between method names and a set of `Decoder` objects that take each message's ABI-encoded parameter and decodes them into something meaningful to TypeScript.