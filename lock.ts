import { RawSemaphore } from "./_raw_semaphore.ts";

/**
 * A mutual exclusion lock that provides safe concurrent access to a shared value.
 *
 * ```ts
 * import { AsyncValue } from "@core/asyncutil/async-value";
 * import { Lock } from "@core/asyncutil/lock";
 *
 * // Critical section
 * const count = new Lock(new AsyncValue(0));
 * await count.lock(async (count) => {
 *   const v = await count.get();
 *   count.set(v + 1);
 * });
 * ```
 */
export class Lock<T> {
  #sem = new RawSemaphore(1);
  #value: T;

  /**
   * Constructs a new lock with the given initial value.
   *
   * @param value The initial value of the lock.
   */
  constructor(value: T) {
    this.#value = value;
  }

  /**
   * Returns true if the lock is currently locked, false otherwise.
   */
  get locked(): boolean {
    return this.#sem.locked;
  }

  /**
   * Acquires the lock and applies the given function to the shared value,
   * returning the result.
   *
   * @param fn The function to apply to the shared value.
   * @returns A Promise that resolves with the result of the function.
   */
  async lock<R>(fn: (value: T) => R | PromiseLike<R>): Promise<R> {
    await this.#sem.acquire();
    try {
      return await fn(this.#value);
    } finally {
      this.#sem.release();
    }
  }
}
