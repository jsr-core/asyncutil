import {
  Deferred,
  deferred,
} from "https://deno.land/std@0.185.0/async/deferred.ts";

/**
 * An event object. Not thread-safe.
 *
 * An event can be used to notify multiple tasks that some event has happend.
 */
export class Event {
  #waiter: Deferred<void> | null;

  constructor() {
    this.#waiter = deferred();
  }

  /**
   * Wait until the event is set.
   *
   * If the event is set, return `true` immediately.
   * Otherwise block until another task calls `set()`.
   */
  async wait(): Promise<true> {
    if (this.#waiter) {
      await this.#waiter;
    }
    return true;
  }

  /**
   * Set the event.
   *
   * All tasks waiting for event to be set will be immediately awakened.
   */
  set(): void {
    if (this.#waiter) {
      this.#waiter.resolve();
      this.#waiter = null;
    }
  }

  /**
   * Clear (unset) the event.
   *
   * Tasks awaiting on `wait()` will now block until the `set()` method is called again.
   */
  clear(): void {
    if (!this.#waiter) {
      this.#waiter = deferred();
    }
  }

  /**
   * Return `true` if the event is set.
   */
  is_set(): boolean {
    return !this.#waiter;
  }
}
