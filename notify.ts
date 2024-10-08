/**
 * Async notifier that allows one or more "waiters" to wait for a notification.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { promiseState } from "@core/asyncutil/promise-state";
 * import { Notify } from "@core/asyncutil/notify";
 *
 * const notify = new Notify();
 * const waiter1 = notify.notified();
 * const waiter2 = notify.notified();
 *
 * notify.notify();
 * assertEquals(await promiseState(waiter1), "fulfilled");
 * assertEquals(await promiseState(waiter2), "pending");
 *
 * notify.notify();
 * assertEquals(await promiseState(waiter1), "fulfilled");
 * assertEquals(await promiseState(waiter2), "fulfilled");
 * ```
 */
export class Notify {
  #waiters: PromiseWithResolvers<void>[] = [];

  /**
   * Returns the number of waiters that are waiting for notification.
   */
  get waiterCount(): number {
    return this.#waiters.length;
  }

  /**
   * Notifies `n` waiters that are waiting for notification. Resolves each of the notified waiters.
   * If there are fewer than `n` waiters, all waiters are notified.
   *
   * @param n The number of waiters to notify.
   * @throws {RangeError} if `n` is not a positive safe integer.
   */
  notify(n = 1): void {
    if (n <= 0 || !Number.isSafeInteger(n)) {
      throw new RangeError(`n must be a positive safe integer, got ${n}`);
    }
    this.#waiters.splice(0, n).forEach(({ resolve }) => resolve());
  }

  /**
   * Notifies all waiters that are waiting for notification. Resolves each of the notified waiters.
   */
  notifyAll(): void {
    this.#waiters.forEach(({ resolve }) => resolve());
    this.#waiters = [];
  }

  /**
   * Asynchronously waits for notification. The caller's execution is suspended until
   * the `notify` method is called. The method returns a Promise that resolves when the caller is notified.
   * Optionally takes an AbortSignal to abort the waiting if the signal is aborted.
   */
  notified({ signal }: { signal?: AbortSignal } = {}): Promise<void> {
    if (signal?.aborted) {
      return Promise.reject(signal.reason);
    }
    const abort = () => {
      const waiter = this.#waiters.shift();
      if (waiter) {
        waiter.reject(signal!.reason);
      }
    };
    signal?.addEventListener("abort", abort, { once: true });
    const waiter = Promise.withResolvers<void>();
    this.#waiters.push(waiter);
    return waiter.promise.finally(() => {
      signal?.removeEventListener("abort", abort);
    });
  }
}
