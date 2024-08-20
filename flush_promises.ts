/**
 * Flush all pending promises in the microtask queue.
 *
 * ```ts
 * import { flushPromises } from "@core/asyncutil/flush-promises";
 *
 * let count = 0;
 * Array.from({ length: 5 }).forEach(() => {
 *   Promise.resolve()
 *     .then(() => count++)
 *     .then(() => count++);
 * });
 *
 * console.log(count); // 0
 * await flushPromises();
 * console.log(count); // 10
 * ```
 *
 * The original idea comes from [flush-promises] package in npm.
 *
 * [flush-promises]: https://www.npmjs.com/package/flush-promises
 */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}
