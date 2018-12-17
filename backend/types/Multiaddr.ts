export interface Multiaddr {
  nodeAddress(): { family: string, address: string, port: string }
}