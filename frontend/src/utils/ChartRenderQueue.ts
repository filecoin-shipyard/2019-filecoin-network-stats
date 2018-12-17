const RENDER_TIMEOUT = 50;

export default class ChartRenderQueue {
  private queue: Function[] = [];

  enqueueRender (cb: (done: () => void) => void) {
    this.queue.unshift(cb);
    setTimeout(() => this.dequeue(), RENDER_TIMEOUT);
  }

  enqueueDispose (cb: (done: () => void) => void) {
    this.queue.push(cb);
    setTimeout(() => this.dequeue(), RENDER_TIMEOUT);
  }

  private dequeue() {
    if (!this.queue.length) {
      return;
    }

    const first = this.queue.shift();
    let fired = false;
    first(() => {
      if (fired) {
        return;
      }

      fired = true;
      setTimeout(() => this.dequeue(), RENDER_TIMEOUT * 3);
    });
  }
}