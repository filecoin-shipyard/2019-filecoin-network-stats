export interface MinerStat {
  nickname: string
  address: string
  peerId: string
  parentHashes: string[]
  power: number
  capacity: number
  lastBlockMined: number
  blockPercentage: number
  height: number
  lastSeen: number
  isInConsensus: boolean
}
