export interface Node {
  lastSeen: number
  lat: number|null
  long: number|null
  height: number
  tipsetHash: string|null
  peerId: string
  nickname: string|null
  minerAddress: string
  power: number
  capacity: number
}