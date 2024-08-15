import { Semaphore } from "./semaphore.ts";

/**
 * A mutex (mutual exclusion) is a synchronization primitive that grants
 * exclusive access to a shared resource.
 *
 * This is a low-level primitive. Use `Lock` instead of `Mutex` if you need to access a shared value
 * concurrently.
 *
 * ```ts
 * import { AsyncValue } from "@core/asyncutil/async-value";
 * import { Mutex } from "@core/asyncutil/mutex";
 *
 * const count = new AsyncValue(0);
 *
 * async function doSomething() {
 *   const v = await count.get();
 *   await count.set(v + 1);
 * }
 *
 * const mu = new Mutex();
 *
 * // Critical section
 * {
 *   using _lock = await mu.acquire();
 *   await doSomething();
 * }
 *
 * // Or with `lock` method
 * await mu.lock(async () => {
 *   await doSomething();
 * });
 * ```
 */
export class Mutex extends Semaphore {
  constructor() {
    super(1);
  }
}
