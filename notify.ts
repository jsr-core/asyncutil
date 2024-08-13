import { iter } from "@core/iterutil/iter";
import { take } from "@core/iterutil/take";

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
  #waiters: Set<PromiseWithResolvers<void>> = new Set();

  /**
   * Returns the number of waiters that are waiting for notification.
   */
  get waiterCount(): number {
    return this.#waiters.size;
  }

  /**
   * Notifies `n` waiters that are waiting for notification. Resolves each of the notified waiters.
   * If there are fewer than `n` waiters, all waiters are notified.
   */
  notify(n = 1): void {
    const it = iter(this.#waiters);
    for (const waiter of take(it, n)) {
      waiter.resolve();
    }
    this.#waiters = new Set(it);
  }

  /**
   * Notifies all waiters that are waiting for notification. Resolves each of the notified waiters.
   */
  notifyAll(): void {
    for (const waiter of this.#waiters) {
      waiter.resolve();
    }
    this.#waiters = new Set();
  }

  /**
   * Asynchronously waits for notification. The caller's execution is suspended until
   * the `notify` method is called. The method returns a Promise that resolves when the caller is notified.
   * Optionally takes an AbortSignal to abort the waiting if the signal is aborted.
   */
  async notified({ signal }: { signal?: AbortSignal } = {}): Promise<void> {
    if (signal?.aborted) {
      throw signal.reason;
    }
    const waiter = Promise.withResolvers<void>();
    const abort = () => {
      this.#waiters.delete(waiter);
      waiter.reject(signal!.reason);
    };
    signal?.addEventListener("abort", abort, { once: true });
    this.#waiters.add(waiter);
    await waiter.promise;
    signal?.removeEventListener("abort", abort);
  }
}
