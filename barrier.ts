import { Notify } from "./notify.ts";

/**
 * A synchronization primitive that allows multiple tasks to wait until all of
 * them have reached a certain point of execution before continuing.
 *
 * A `Barrier` is initialized with a size `n`. Once created, `n` tasks can call
 * the `wait` method on the `Barrier`. The `wait` method blocks until `n` tasks
 * have called it. Once all `n` tasks have called `wait`, all tasks will
 * unblock and continue executing.
 *
 * ```ts
 * import { Barrier } from "./barrier.ts";
 *
 * const barrier = new Barrier(3);
 *
 * async function worker(id: number) {
 *   console.log(`worker ${id} is waiting`);
 *   await barrier.wait();
 *   console.log(`worker ${id} is done`);
 * }
 *
 * worker(1);
 * worker(2);
 * worker(3);
 * ```
 */
export class Barrier {
  #notify = new Notify();
  #rest: number;

  /**
   * Creates a new `Barrier` that blocks until `size` threads have called `wait`.
   *
   * @param size - The number of threads that must reach the barrier before it unblocks.
   * @throws Error if size is negative.
   */
  constructor(size: number) {
    if (size < 0) {
      throw new Error("The size must be greater than 0");
    }
    this.#rest = size;
  }

  /**
   * Wait for all threads to reach the barrier.
   * Blocks until all threads reach the barrier.
   */
  async wait(): Promise<void> {
    this.#rest -= 1;
    if (this.#rest === 0) {
      await Promise.all([
        this.#notify.notified(),
        this.#notify.notifyAll(),
      ]);
    } else {
      await this.#notify.notified();
    }
  }
}
