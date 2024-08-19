import { RawSemaphore } from "./_raw_semaphore.ts";

/**
 * A mutex (mutual exclusion) is a synchronization primitive that grants
 * exclusive access to a shared resource.
 *
 * This is a low-level primitive. Use `Lock` instead of `Mutex` if you need to access a shared value
 * concurrently.
 *
 * ```ts
 * import { AsyncValue } from "@core/asyncutil/async-value";
 * import { Mutex } from "@core/asyncutil/mutex";
 *
 * const count = new AsyncValue(0);
 *
 * async function doSomething() {
 *   const v = await count.get();
 *   await count.set(v + 1);
 * }
 *
 * const mu = new Mutex();
 *
 * // Critical section
 * {
 *   using _lock = await mu.acquire();
 *   await doSomething();
 * }
 * ```
 */
export class Mutex {
  #sem: RawSemaphore = new RawSemaphore(1);

  /**
   * Returns true if the mutex is locked, false otherwise.
   */
  get locked(): boolean {
    return this.#sem.locked;
  }

  /**
   * Acquire the mutex and return a promise with disposable that releases the mutex when disposed.
   *
   * @returns A Promise with Disposable that releases the mutex when disposed.
   */
  acquire(): Promise<Disposable> {
    return this.#sem.acquire().then(() => ({
      [Symbol.dispose]: () => {
        this.#sem.release();
      },
    }));
  }
}
