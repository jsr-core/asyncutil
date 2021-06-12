import { Lock } from "./lock.ts";
import { Event } from "./event.ts";

/**
 * A Condition object. Not thread-safe.
 *
 * A condition primitive can be used by a task to wait for some event to happen
 * and then get exclusive access to a shared resource.
 *
 * In essence, a Condition object combines the functionality of an Event and Lock.
 * It is possible to have multiple Condition objects share one Lock, which allows
 * coordinating exclusive access to a shared resource between different tasks interested
 * in particular states of that shared resource.
 *
 * The optional lock argument must be a Lock object or undefined. In the latter case a
 * new Lock object is created automatically.
 *
 * The preferred way to use a Condition is `with()` method.
 */
export class Condition {
  #lock: Lock;
  #waiters: Event[];

  constructor(lock?: Lock) {
    this.#lock = lock ?? new Lock();
    this.#waiters = [];
  }

  /**
   * Acuire the lock and execute callback to access shared state.
   *
   * This is preferred way to use a Condition.
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
   * Acquire the underlying lock.
   *
   * This method waits until the underlying lock is unlocked, sets it to locked and returns true.
   */
  async acquire(): Promise<true> {
    await this.#lock.acquire();
    return true;
  }

  /**
   * Release the underlying lock.
   *
   * When invoked on an unlocked lock, an Error is thrown.
   */
  release(): void {
    this.#lock.release();
  }

  /**
   * Return `true` if the underlying lock is acquired.
   */
  locked(): boolean {
    return this.#lock.locked();
  }

  /**
   * Wake up at most n tasks (1 by default) waiting on this condition.
   * The method is no-op if no tasks are waiting.
   *
   * The lock must be acquired before this method is called and released
   * shortly after. If called with an unlocked lock an Error is thrown.
   */
  notify(n = 1): void {
    if (!this.locked()) {
      throw new Error("The lock is not acquired");
    }
    for (const _ of Array(n)) {
      const waiter = this.#waiters.shift();
      if (!waiter) {
        break;
      }
      waiter.set();
    }
  }

  /**
   * Wake up all tasks waiting on this condition.
   *
   * This method acts like `notify()`, but wakes up all waiting tasks.
   *
   * The lock must be acquired before this method is called and released
   * shortly after. If called with an unlocked lock an Error is thrown.
   */
  notify_all(): void {
    this.notify(this.#waiters.length);
  }

  /**
   * Wait until notified.
   *
   * If the calling task has not acquired the lock when this method is called,
   * an Error is thrown.
   *
   * This method release the underlying lock, and the blocks until it is awakened
   * by a `notify()` or `notify_all()` call. Once awakened, the Condition re-acquires
   * itsock and this method returns `true`.
   */
  async wait(): Promise<true> {
    if (!this.locked()) {
      throw new Error("The lock is not acquired");
    }
    const event = new Event();
    this.#waiters.push(event);
    this.release();
    await event.wait();
    await this.acquire();
    return true;
  }

  /**
   * Wait until a predicate becomes true.
   *
   * The predicate must be a callable which result is a boolean value.
   */
  async wait_for(predicate: () => boolean): Promise<void> {
    while (!predicate()) {
      await this.wait();
    }
  }
}
