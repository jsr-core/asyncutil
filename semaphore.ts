import { Notify } from "./notify.ts";

/**
 * A semaphore that allows a limited number of concurrent executions of an operation.
 *
 * ```ts
 * import { Semaphore } from "https://deno.land/x/async@$MODULE_VERSION/semaphore.ts";
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
  #notify = new Notify();
  #rest: number;

  /**
   * Creates a new semaphore with the specified limit.
   *
   * @param size - The maximum number of times the semaphore can be acquired before blocking.
   * @throws Error if size is less than 1.
   */
  constructor(size: number) {
    if (size < 0) {
      throw new Error("The size must be greater than 0");
    }
    this.#rest = size + 1;
  }

  /**
   * Returns true if the semaphore is currently locked.
   */
  get locked(): boolean {
    return this.#rest === 0;
  }

  /**
   * Acquires a lock on the semaphore, and invokes the specified function.
   *
   * @param f - The function to invoke.
   * @returns A promise that resolves to the return value of the specified function.
   */
  async lock<R>(f: () => R | PromiseLike<R>): Promise<R> {
    await this.#acquire();
    try {
      return await f();
    } finally {
      this.#release();
    }
  }

  async #acquire(): Promise<void> {
    if (this.#rest > 0) {
      this.#rest -= 1;
    }
    if (this.#rest === 0) {
      await this.#notify.notified();
    }
  }

  #release(): void {
    if (this.#notify.waiters > 0) {
      this.#notify.notify();
    }
    if (this.#notify.waiters === 0) {
      this.#rest += 1;
    }
  }
}
