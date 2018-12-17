declare module 'pull-stream' {
  interface PullStream {
    (source: any, through: any, sink?: any): PullStream

    map (cb: (data: any) => any): any

    drain (cb: (data: any) => void): any
  }

  const pull: PullStream;
  export = pull
}