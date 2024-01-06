import { Notify } from "./notify.ts";

/**
 * `WaitGroup` is a synchronization primitive that enables promises to coordinate
 * and synchronize their execution. It is particularly useful in scenarios where
 * a specific number of tasks must complete before the program can proceed.
 *
 * ```ts
 * import { delay } from "https://deno.land/std@0.211.0/async/delay.ts";
 * import { WaitGroup } from "https://deno.land/x/async@$MODULE_VERSION/wait_group.ts";
 *
 * const wg = new WaitGroup();
 *
 * async function worker(id: number) {
 *   wg.add(1);
 *   console.log(`worker ${id} is waiting`);
 *   await delay(100);
 *   console.log(`worker ${id} is done`);
 *   wg.done();
 * }
 *
 * worker(1);
 * worker(2);
 * worker(3);
 * await wg.wait();
 * ```
 */
export class WaitGroup {
  #notify = new Notify();
  #count = 0;

  /**
   * Adds the specified `delta` to the WaitGroup counter. If the counter becomes
   * zero, it signals all waiting promises to proceed.
   * @param delta The number to add to the counter. It can be positive or negative.
   */
  add(delta: number): void {
    this.#count += delta;
    if (this.#count === 0) {
      this.#notify.notifyAll();
    }
  }

  /**
   * Decrements the WaitGroup counter by 1, equivalent to calling `add(-1)`.
   */
  done(): void {
    this.add(-1);
  }

  /**
   * Returns a promise that waits for the WaitGroup counter to reach zero.
   * @returns A Promise that resolves when the counter becomes zero.
   */
  wait(): Promise<void> {
    return this.#notify.notified();
  }
}
