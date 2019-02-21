export type Mutexes = { [k: string]: Promise<void> }

export default class KeyedMutex {
  private awaiters: Mutexes = {};

  public isLocked (key: string): boolean {
    return !!this.awaiters[key]
  }

  public lock (key: string): () => void {
    if (this.isLocked(key)) {
      throw new Error('already locked')
    }

    let resolve: () => void;
    this.awaiters[key] = new Promise<void>((res) => {
      resolve = res;
    });

    return () => {
      delete this.awaiters[key];
      resolve();
    };
  }

  public async block (key: string) {
    if (!this.awaiters[key]) {
      return;
    }

    await this.awaiters[key];
  }
}