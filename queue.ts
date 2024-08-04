import { Notify } from "./notify.ts";

/**
 * A queue implementation that allows for adding and removing elements, with optional waiting when
 * popping elements from an empty queue.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Queue } from "@core/asyncutil/queue";
 *
 * const queue = new Queue<number>();
 * queue.push(1);
 * queue.push(2);
 * queue.push(3);
 * assertEquals(await queue.pop(), 1);
 * assertEquals(await queue.pop(), 2);
 * assertEquals(await queue.pop(), 3);
 * ```
 */
export class Queue<T> {
  #notify = new Notify();
  #items: T[] = [];

  /**
   * Gets the number of items in the queue.
   */
  get size(): number {
    return this.#items.length;
  }

  /**
   * Returns true if the queue is currently locked.
   */
  get locked(): boolean {
    return this.#notify.waiterCount > 0;
  }

  /**
   * Adds an item to the end of the queue and notifies any waiting consumers.
   */
  push(value: T): void {
    this.#items.push(value);
    this.#notify.notify();
  }

  /**
   * Removes the next item from the queue, optionally waiting if the queue is currently empty.
   *
   * @returns A promise that resolves to the next item in the queue.
   */
  async pop({ signal }: { signal?: AbortSignal } = {}): Promise<T> {
    while (!signal?.aborted) {
      const value = this.#items.shift();
      if (value) {
        return value;
      }
      await this.#notify.notified({ signal });
    }
    throw new DOMException("Aborted", "AbortError");
  }
}
