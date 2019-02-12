export interface Node {
  lastSeen: number
  lat: number|null
  long: number|null
  height: number
  peerId: string
  nickname: string|null
  minerAddress: string
  power: number
  capacity: number
}