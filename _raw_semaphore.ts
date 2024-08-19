/**
 * @internal
 */
export class RawSemaphore {
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
   * Acquires the semaphore, blocking until the semaphore is available.
   */
  acquire(): Promise<void> {
    if (this.#value > 0) {
      this.#value -= 1;
      return Promise.resolve();
    } else {
      const { promise, resolve } = Promise.withResolvers<void>();
      this.#resolves.push(resolve);
      return promise;
    }
  }

  /**
   * Releases the semaphore, allowing the next waiting operation to proceed.
   */
  release(): void {
    const resolve = this.#resolves.shift();
    if (resolve) {
      resolve();
    } else if (this.#value < this.#size) {
      this.#value += 1;
    }
  }
}
