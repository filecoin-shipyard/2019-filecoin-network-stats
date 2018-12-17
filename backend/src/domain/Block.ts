export interface Block {
  height: number,
  cid: string,
  miner: string
  parentWeight: number,
  nonce: number,
  ingestedAt: number
}