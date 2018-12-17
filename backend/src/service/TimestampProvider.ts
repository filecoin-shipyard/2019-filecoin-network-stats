export interface ITimestampProvider {
  now(): number
}

export default class SystemTimestampProvider implements ITimestampProvider {
  now (): number {
    return Math.floor(Date.now() / 1000);
  }
}