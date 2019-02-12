export interface Block {
  height: number,
  miner: string
  parentWeight: number,
  nonce: number,
  ingestedAt: number
}