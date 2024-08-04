/**
 * Promise state
 */
export type PromiseState = "fulfilled" | "rejected" | "pending";

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
 */
export async function promiseState(p: Promise<unknown>): Promise<PromiseState> {
  // NOTE:
  // This 0 delay promise is required to refresh internal states of promises
  await new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 0);
  });
  const t = {};
  return Promise.race([p, t]).then(
    (v) => (v === t ? "pending" : "fulfilled"),
    () => "rejected",
  );
}
