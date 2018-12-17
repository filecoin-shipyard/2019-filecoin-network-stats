export interface Config {
  dbUrl: string
  redisUrl: string
  fullNodeUrl: string
  isMaster: boolean
  peerInfoFile: string
  heartbeatPort: string
  apiPort: string
}

export function fromEnv (): Config {
  return {
    dbUrl: process.env.DB_URL!,
    redisUrl: process.env.REDIS_URL!,
    fullNodeUrl: process.env.FULL_NODE_URL!,
    isMaster: process.env.IS_MASTER === 'true',
    peerInfoFile: process.env.PEER_INFO_FILE!,
    heartbeatPort: process.env.HEARTBEAT_PORT!,
    apiPort: process.env.API_PORT!
  };
}