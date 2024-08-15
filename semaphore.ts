/**
 * A semaphore that allows a limited number of concurrent executions of an operation.
 *
 * ```ts
 * import { Semaphore } from "@core/asyncutil/semaphore";
 *
 * const sem = new Semaphore(5);
 *
 * const worker = async () => {
 *   using _lock = await sem.acquire();
 *   // do something
 * };
 * await Promise.all([...Array(10)].map(() => worker()));
 * ```
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
  #waiters = new Set<PromiseWithResolvers<void>>();
  #value: number;

  /**
   * Creates a new semaphore with the specified limit.
   *
   * @param size The maximum number of times the semaphore can be acquired before blocking.
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
   * Returns true if the semaphore is currently locked.
   */
  get locked(): boolean {
    return this.#value === 0;
  }

  /**
   * Acquires a lock and invokes the specified function.
   *
   * @param fn The function to invoke.
   * @returns A promise that resolves to the return value of the specified function.
   */
  async lock<R>(fn: () => R | PromiseLike<R>): Promise<R> {
    using _lock = await this.acquire();
    return await fn();
  }

  /**
   * Acquire a lock and return a promise with disposable that releases the a lock when disposed.
   *
   * @returns A Promise with Disposable that releases the mutex when disposed.
   */
  acquire(): Promise<Disposable> & Disposable {
    const disposable = {
      [Symbol.dispose]: () => this.#release(),
    };
    if (this.#value > 0) {
      this.#value -= 1;
      return Object.assign(Promise.resolve(disposable), disposable);
    }
    const waiter = Promise.withResolvers<void>();
    this.#waiters.add(waiter);
    return Object.assign(waiter.promise.then(() => disposable), disposable);
  }

  #release(): void {
    if (this.#waiters.size > 0) {
      const waiters = this.#waiters;
      const [waiter] = waiters.keys();
      waiters.delete(waiter);
      waiter.resolve();
    } else {
      this.#value += 1;
    }
  }
}
