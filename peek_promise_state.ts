const t = Symbol("pending mark");

/**
 * Promise state
 */
export type PromiseState = "fulfilled" | "rejected" | "pending";

/**
 * Peek the current state (fulfilled, rejected, or pending) of the promise.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { peekPromiseState } from "@core/asyncutil/peek-promise-state";
 *
 * assertEquals(await peekPromiseState(Promise.resolve("value")), "fulfilled");
 * assertEquals(await peekPromiseState(Promise.reject("error")), "rejected");
 * assertEquals(await peekPromiseState(new Promise(() => {})), "pending");
 * ```
 *
 * Use {@linkcode https://jsr.io/@core/asyncutil/doc/flush-promises/~/flushPromises flushPromises}
 * to wait for all pending promises to be resolved prior to calling this function.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { flushPromises } from "@core/asyncutil/flush-promises";
 * import { peekPromiseState } from "@core/asyncutil/peek-promise-state";
 *
 * const p = Promise.resolve<void>(undefined)
 *   .then(() => {})
 *   .then(() => {});
 * assertEquals(await peekPromiseState(p), "pending");
 * await flushPromises();
 * assertEquals(await peekPromiseState(p), "fulfilled");
 * ```
 */
export function peekPromiseState(p: Promise<unknown>): Promise<PromiseState> {
  return Promise.race([p, t]).then(
    (v) => (v === t ? "pending" : "fulfilled"),
    () => "rejected",
  );
}
