import { Lock } from "./lock.ts";

/**
 * A Semaphore object. Not thread-safe.
 *
 * A semaphore managers an internal counter which is decremented by each `acquire()` call
 * and incremented by each `release()` call. The counter can never go below zero; when
 * `acquire()` finds that it is zero, it blocks, waiting until some task calls `release()`.
 *
 * The optinal value argument gives the initial value for the internal counter (1 by default).
 * If the given value is less than 0 an Error is thrown.
 *
 * The preferred way to use a Semaphore is `with()` method.
 */
export class Semaphore {
  protected value: number;
  #lock: Lock;

  constructor(value = 1) {
    if (value < 0) {
      throw new Error("The value must be greater than 0");
    }
    this.#lock = new Lock();
    this.value = value;
  }

  /**
   * Acuire the lock and execute callback to access shared state.
   *
   * This is preferred way to use a Semaphore.
   */
  async with(callback: () => void | Promise<void>): Promise<void> {
    await this.acquire();
    try {
      await (callback() ?? Promise.resolve());
    } finally {
      this.release();
    }
  }

  /**
   * Acquire a semaphore.
   *
   * If the internal counter is greater than zero, decrement it by one and return `true`
   * immediately. If it is zero, wait until a `release()` is called and return `true`.
   */
  async acquire(): Promise<true> {
    if (this.value > 0) {
      this.value -= 1;
    }
    if (this.value === 0) {
      await this.#lock.acquire();
    }
    return true;
  }

  /**
   * Release a semaphore, incrementing the internal counter by one. Can wak up a task
   * waiting to acquire the semaphore.
   *
   * Unlike BoundedSemaphore, Semaphore allows making more `release()` calls than
   * `acquire()` calls.
   */
  release(): void {
    if (this.#lock.locked()) {
      this.#lock.release();
    }
    if (!this.#lock.locked()) {
      this.value += 1;
    }
  }

  /**
   * Return `true` if semaphore can not be acquired immediately.
   */
  locked(): boolean {
    return this.value === 0;
  }
}

/**
 * A bounded semaphore object. Not thread-safe.
 *
 * Bounded Semaphore is a version of Semaphore that throws an Error in release() if it increases
 * the internal counte above the initial value.
 */
export class BoundedSemaphore extends Semaphore {
  #bound: number;

  constructor(value = 1) {
    super(value);
    this.#bound = value;
  }

  /**
   * Release a semaphore, incrementing the internal counter by one. Can wak up a task
   * waiting to acquire the semaphore.
   */
  release(): void {
    if (this.value === this.#bound) {
      throw new Error(
        "release() cannot be called more than acquire() with BoundedSemaphore",
      );
    }
    super.release();
  }
}
