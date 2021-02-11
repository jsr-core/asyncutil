import {
  Deferred,
  deferred,
} from "https://deno.land/std@0.86.0/async/deferred.ts";

/**
 * Implements a mutex lock for Promise. Not thread-safe.
 *
 * A lock can be used to guarantee exclusive access to a shared resource.
 */
export class Lock {
  #waiters: Deferred<void>[];

  constructor() {
    this.#waiters = [];
  }

  /**
   * Acuire the lock and execute callback to access shared state.
   *
   * This is preferred way to use a Lock.
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
   * Acuire the lock.
   *
   * This method waits until the lock is *unlocked*, sets it to *locked* and returns `true`.
   *
   * When more than one coroutine is blocked in `acquire()` waiting for the lock to be unlocked, only
   * one coroutine eventually proceeds.
   *
   * Acquiring a lock is *fair*, the coroutine that proceeds will be the first coroutine that started
   * waiting on the lock.
   */
  async acquire(): Promise<true> {
    const waiters = [...this.#waiters];
    this.#waiters.push(deferred());
    if (waiters.length) {
      await Promise.all(waiters);
    }
    return true;
  }

  /**
   * Release the lock.
   *
   * When the lock is *locked*, reset it to *unlocked* and return.
   *
   * If the lock is *unlocked*, an Error is thrown.
   */
  release(): void {
    const waiter = this.#waiters.shift();
    if (waiter) {
      waiter.resolve();
    } else {
      throw new Error("The lock is not locked");
    }
  }

  /**
   * Return `true` if the lock is *locked*.
   */
  locked(): boolean {
    return !!this.#waiters.length;
  }
}
