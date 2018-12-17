import BigNumber from 'bignumber.js';

export interface Ask {
  id: number
  price: BigNumber
  expiresAt: number
  address: string
}
export interface AskJSON {
  id: number
  price: string
  expiresAt: number
  address: string
}

export function askToJSON (ask: Ask): AskJSON {
  return {
    id: ask.id,
    price: ask.price.toFixed(0),
    expiresAt: ask.expiresAt,
    address: ask.address,
  };
}

export function askFromJSON (ask: AskJSON): Ask {
  return {
    id: ask.id,
    price: new BigNumber(ask.price),
    expiresAt: ask.expiresAt,
    address: ask.address,
  };
}
