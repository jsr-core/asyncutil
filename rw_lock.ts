import { Mutex } from "./mutex.ts";

/**
 * A reader-writer lock implementation that allows multiple concurrent reads but only one write at a time.
 * Readers can acquire the lock simultaneously as long as there are no writers holding the lock.
 * Writers block all other readers and writers until the write operation completes.
 *
 * ```ts
 * import { AsyncValue } from "@core/asyncutil/async-value";
 * import { RwLock } from "@core/asyncutil/rw-lock";
 *
 * const count = new RwLock(new AsyncValue(0));
 *
 * // rlock should allow multiple readers at a time
 * await Promise.all([...Array(10)].map(() => {
 *   return count.rlock(async (count) => {
 *     console.log(await count.get());
 *   });
 * }));
 *
 * // lock should allow only one writer at a time
 * await Promise.all([...Array(10)].map(() => {
 *   return count.lock(async (count) => {
 *     const v = await count.get();
 *     console.log(v);
 *     count.set(v + 1);
 *   });
 * }));
 * ```
 */
export class RwLock<T> {
  #read = new Mutex();
  #write = new Mutex();
  #value: T;

  /**
   * Creates a new `RwLock` with the specified initial value.
   *
   * @param value The initial value of the lock.
   */
  constructor(value: T) {
    this.#value = value;
  }

  /**
   * Acquires the lock for both reading and writing, and invokes the specified function with the current
   * value of the lock. All other readers and writers will be blocked until the function completes.
   *
   * @param fn The function to invoke.
   * @returns A promise that resolves to the return value of the specified function.
   */
  async lock<R>(fn: (value: T) => R | PromiseLike<R>): Promise<R> {
    await Promise.all([
      this.#write.acquire(),
      this.#read.acquire(),
    ]);
    try {
      return await fn(this.#value);
    } finally {
      this.#read.release();
      this.#write.release();
    }
  }

  /**
   * Acquires the lock for reading, and invokes the specified function with the current value of the lock.
   * Other readers can acquire the lock simultaneously, but any writers will be blocked until the function completes.
   *
   * @param fn The function to invoke.
   * @returns A promise that resolves to the return value of the specified function.
   */
  async rlock<R>(fn: (value: T) => R | PromiseLike<R>): Promise<R> {
    if (this.#write.locked) {
      await this.#write.acquire();
    }
    this.#read.acquire();
    try {
      return await fn(this.#value);
    } finally {
      this.#read.release();
      this.#write.release();
    }
  }
}
