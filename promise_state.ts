import { flushPromises } from "./flush_promises.ts";
import { peekPromiseState, type PromiseState } from "./peek_promise_state.ts";

/**
 * Return state (fulfilled/rejected/pending) of a promise
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { promiseState } from "@core/asyncutil/promise-state";
 *
 * assertEquals(await promiseState(Promise.resolve("value")), "fulfilled");
 * assertEquals(await promiseState(Promise.reject("error")), "rejected");
 * assertEquals(await promiseState(new Promise(() => {})), "pending");
 * ```
 *
 * @deprecated Use {@linkcode https://jsr.io/@core/asyncutil/doc/peek-promise-state/~/peekPromiseState peekPromiseState} with {@linkcode https://jsr.io/@core/asyncutil/doc/flush-promises/~/flushPromises flushPromises} instead.
 */
export async function promiseState(p: Promise<unknown>): Promise<PromiseState> {
  await flushPromises();
  return peekPromiseState(p);
}

export type { PromiseState };
