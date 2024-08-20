/**
 * Ensure that a value is a promise.
 *
 * It returns the value if it is already a promise, otherwise it returns a
 * promise that resolves to the value.
 *
 * @param value - The value to ensure as a promise.
 * @returns A promise that resolves to the value.
 *
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import { ensurePromise } from "@core/asyncutil/ensure-promise";
 *
 * assertEquals(await ensurePromise(42), 42);
 * assertEquals(await ensurePromise(Promise.resolve(42)), 42);
 * ```
 */
export function ensurePromise<T>(value: T): Promise<T> {
  return value instanceof Promise ? value : Promise.resolve(value);
}
