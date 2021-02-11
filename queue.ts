import { Condition } from "./condition.ts";

export class QueueEmpty extends Error {}

export class QueueFull extends Error {}

/**
 * A first in, first out (FIFO) queue. Non thread-safe.
 *
 * If maxsize is less than or equal to zero, the queue size is infinite.
 * If it is an integer greater than 0, then await put() blocks when the
 * queue reaches maxsize until an item is removed by get().
 *
 * Not like Python asyncio's Queue, join()/task_done() methods are not
 * implemented.
 */
export class Queue<T> {
  #queue: T[];
  #maxsize: number;
  #full_notifier: Condition;
  #empty_notifier: Condition;

  constructor(maxsize = 0) {
    this.#queue = [];
    this.#maxsize = maxsize <= 0 ? 0 : maxsize;
    this.#full_notifier = new Condition();
    this.#empty_notifier = new Condition();
  }

  /**
   * Return `true` if the queue is empty, `false` otherwise.
   */
  empty(): boolean {
    return !this.#queue.length;
  }

  /**
   * Return `true` if there are `maxsize` items in the queue.
   * If the queue was initialized with maxsize=0 (the default), then
   * `full()` never returns `true`.
   */
  full(): boolean {
    return !!this.#maxsize && this.#queue.length === this.#maxsize;
  }

  /**
   * Remove and return an item from the queue.
   * If queue is empty, wait until an item is available.
   */
  async get(): Promise<T> {
    const value = this.#queue.shift();
    if (!value) {
      return new Promise((resolve) => {
        this.#empty_notifier.with(async () => {
          await this.#empty_notifier.wait_for(() => !!this.#queue.length);
          resolve(await this.get());
        });
      });
    }
    await this.#full_notifier.with(() => {
      this.#full_notifier.notify();
    });
    return value;
  }

  /**
   * Return an item if one is immediately available, else throw a QueueEmpty error.
   */
  get_nowait(): T {
    const value = this.#queue.shift();
    if (!value) {
      throw new QueueEmpty("Queue empty");
    }
    this.#full_notifier.with(() => {
      this.#full_notifier.notify();
    });
    return value;
  }

  /**
   * Put an item into the queue. If the queue is full, wait until a free slot
   * is available before adding the item.
   */
  async put(value: T): Promise<void> {
    if (this.#maxsize && this.#queue.length >= this.#maxsize) {
      await this.#full_notifier.with(async () => {
        await this.#full_notifier.wait_for(
          () => this.#queue.length < this.#maxsize,
        );
        await this.put(value);
      });
      return;
    }
    await this.#empty_notifier.with(() => {
      this.#empty_notifier.notify();
    });
    this.#queue.push(value);
  }

  /**
   * Put an item into the queue without blocking.
   * If no free slot is immediately available, throw a QueueFull error.
   */
  put_nowait(value: T): void {
    if (this.#maxsize && this.#queue.length >= this.#maxsize) {
      throw new QueueFull("Queue full");
    }
    this.#empty_notifier.with(() => {
      this.#empty_notifier.notify();
    });
    this.#queue.push(value);
  }

  /**
   * Return the number of items in the queue.
   */
  qsize(): number {
    return this.#queue.length;
  }
}
