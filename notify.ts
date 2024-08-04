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
  #waiters: {
    promise: Promise<void>;
    resolve: () => void;
    reject: (reason?: unknown) => void;
  }[] = [];

  /**
   * Returns the number of waiters that are waiting for notification.
   */
  get waiters(): number {
    return this.#waiters.length;
  }

  /**
   * Notifies `n` waiters that are waiting for notification. Resolves each of the notified waiters.
   * If there are fewer than `n` waiters, all waiters are notified.
   */
  notify(n = 1): void {
    const head = this.#waiters.slice(0, n);
    const tail = this.#waiters.slice(n);
    for (const waiter of head) {
      waiter.resolve();
    }
    this.#waiters = tail;
  }

  /**
   * Notifies all waiters that are waiting for notification. Resolves each of the notified waiters.
   */
  notifyAll(): void {
    for (const waiter of this.#waiters) {
      waiter.resolve();
    }
    this.#waiters = [];
  }

  /**
   * Asynchronously waits for notification. The caller's execution is suspended until
   * the `notify` method is called. The method returns a Promise that resolves when the caller is notified.
   * Optionally takes an AbortSignal to abort the waiting if the signal is aborted.
   */
  async notified({ signal }: { signal?: AbortSignal } = {}): Promise<void> {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    const waiter = Promise.withResolvers<void>();
    const abort = () => {
      removeItem(this.#waiters, waiter);
      waiter.reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
    this.#waiters.push(waiter);
    await waiter.promise;
    signal?.removeEventListener("abort", abort);
  }
}

function removeItem<T>(array: T[], item: T): void {
  const index = array.indexOf(item);
  array.splice(index, 1);
}
