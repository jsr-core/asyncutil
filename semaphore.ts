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
  #resolves: (() => void)[] = [];
  #value: number;
  #size: number;

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
    this.#size = size;
  }

  /**
   * Returns true if the semaphore is currently locked.
   */
  get locked(): boolean {
    return this.#value === 0;
  }

  /**
   * Acquires a lock on the semaphore, and invokes the specified function.
   *
   * @param fn The function to invoke.
   * @returns A promise that resolves to the return value of the specified function.
   */
  async lock<R>(fn: () => R | PromiseLike<R>): Promise<R> {
    await this.#acquire();
    try {
      return await fn();
    } finally {
      this.#release();
    }
  }

  #acquire(): Promise<void> {
    if (this.#value > 0) {
      this.#value -= 1;
      return Promise.resolve();
    } else {
      const { promise, resolve } = Promise.withResolvers<void>();
      this.#resolves.push(resolve);
      return promise;
    }
  }

  #release(): void {
    const resolve = this.#resolves.shift();
    if (resolve) {
      resolve();
    } else if (this.#value < this.#size) {
      this.#value += 1;
    }
  }
}
