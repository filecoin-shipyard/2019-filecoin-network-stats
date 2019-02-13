export interface MinerStat {
  nickname: string
  address: string
  peerId: string
  parentHashes: string[]
  power: number
  capacity: number
  blockHeight: number
  blockPercentage: number
  blockTime: number
  isInConsensus: boolean
  lastSeen: number
}
