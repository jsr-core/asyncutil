import { Mutex } from "./mutex.ts";

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
 *
 * @typeParam T - The type of the shared value.
 */
export class Lock<T> {
  #mu = new Mutex();
  #value: T;

  /**
   * Constructs a new lock with the given initial value.
   *
   * @param value - The initial value of the lock.
   */
  constructor(value: T) {
    this.#value = value;
  }

  /**
   * Returns true if the lock is currently locked, false otherwise.
   */
  get locked(): boolean {
    return this.#mu.locked;
  }

  /**
   * Acquires the lock and applies the given function to the shared value,
   * returning the result.
   *
   * @typeParam R - The return type of the function.
   * @param f - The function to apply to the shared value.
   * @returns A Promise that resolves with the result of the function.
   */
  async lock<R>(f: (value: T) => R | PromiseLike<R>): Promise<R> {
    await this.#mu.acquire();
    try {
      return await f(this.#value);
    } finally {
      this.#mu.release();
    }
  }
}
