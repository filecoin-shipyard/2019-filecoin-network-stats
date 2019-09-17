export interface Block {
  height: number
  miner: string
  parentWeight: number
  ingestedAt: number
  parents: string[]
}