import { Notify } from "./notify.ts";

/**
 * A stack implementation that allows for adding and removing elements, with optional waiting when
 * popping elements from an empty stack.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { Stack } from "@core/asyncutil/stack";
 *
 * const stack = new Stack<number>();
 * stack.push(1);
 * stack.push(2);
 * stack.push(3);
 * assertEquals(await stack.pop(), 3);
 * assertEquals(await stack.pop(), 2);
 * assertEquals(await stack.pop(), 1);
 * ```
 *
 * @template T The type of items in the stack.
 */
export class Stack<T extends NonNullable<unknown> | null> {
  #notify = new Notify();
  #items: T[] = [];

  /**
   * Gets the number of items in the queue.
   */
  get size(): number {
    return this.#items.length;
  }

  /**
   * Returns true if the stack is currently locked.
   */
  get locked(): boolean {
    return this.#notify.waiterCount > 0;
  }

  /**
   * Adds an item to the top of the stack and notifies any waiting consumers.
   *
   * @param value The item to add to the stack.
   */
  push(value: T): void {
    this.#items.push(value);
    this.#notify.notify();
  }

  /**
   * Removes the next item from the stack, optionally waiting if the stack is currently empty.
   *
   * @returns A promise that resolves to the next item in the stack.
   */
  async pop({ signal }: { signal?: AbortSignal } = {}): Promise<T> {
    while (true) {
      signal?.throwIfAborted();
      const value = this.#items.pop();
      if (value !== undefined) {
        return value;
      }
      await this.#notify.notified({ signal });
    }
  }
}
