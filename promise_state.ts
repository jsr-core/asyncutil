/**
 * Promise state
 */
export type PromiseState = "fulfilled" | "rejected" | "pending";

/**
 * Return state (fulfilled/rejected/pending) of a promise
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
