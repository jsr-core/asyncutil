import { RawSemaphore } from "./_raw_semaphore.ts";

/**
 * A semaphore that allows a limited number of concurrent executions of an operation.
 *
 * ```ts
 * import { Semaphore } from "@core/asyncutil/semaphore";
 *
 * const sem = new Semaphore(5);
 * const worker = () => {
 *   return sem.lock(async () => {
 *     // do something
 *   });
 * };
 * await Promise.all([...Array(10)].map(() => worker()));
 * ```
 */
export class Semaphore {
  #sem: RawSemaphore;

  /**
   * Creates a new semaphore with the specified limit.
   *
   * @param size The maximum number of times the semaphore can be acquired before blocking.
   * @throws {RangeError} if the size is not a positive safe integer.
   */
  constructor(size: number) {
    this.#sem = new RawSemaphore(size);
  }

  /**
   * Returns true if the semaphore is currently locked.
   */
  get locked(): boolean {
    return this.#sem.locked;
  }

  /**
   * Acquires a lock on the semaphore, and invokes the specified function.
   *
   * @param fn The function to invoke.
   * @returns A promise that resolves to the return value of the specified function.
   */
  async lock<R>(fn: () => R | PromiseLike<R>): Promise<R> {
    await this.#sem.acquire();
    try {
      return await fn();
    } finally {
      this.#sem.release();
    }
  }
}
