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
 * import { Barrier } from "@core/asyncutil/barrier";
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
  #waiter: PromiseWithResolvers<void> = Promise.withResolvers();
  #value: number;

  /**
   * Creates a new `Barrier` that blocks until `size` threads have called `wait`.
   *
   * @param size The number of threads that must reach the barrier before it unblocks.
   * @throws {RangeError} if the size is not a positive safe integer.
   */
  constructor(size: number) {
    if (size <= 0 || !Number.isSafeInteger(size)) {
      throw new RangeError(
        `size must be a positive safe integer, got ${size}`,
      );
    }
    this.#value = size;
  }

  /**
   * Wait for all threads to reach the barrier.
   * Blocks until all threads reach the barrier.
   */
  wait({ signal }: { signal?: AbortSignal } = {}): Promise<void> {
    if (signal?.aborted) {
      return Promise.reject(signal.reason);
    }
    const { promise, resolve, reject } = this.#waiter;
    const abort = () => reject(signal!.reason);
    signal?.addEventListener("abort", abort, { once: true });
    this.#value -= 1;
    if (this.#value === 0) {
      resolve();
    }
    return promise.finally(() => signal?.removeEventListener("abort", abort));
  }
}
