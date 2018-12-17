export interface MessageJSON {
  meteredMessage: {
    message: {
      to: string
      from: string
      nonce: string
      value: string|null
      method: string
      params: any
    }

    gasPrice: string

    gasLimit: string
  }
}