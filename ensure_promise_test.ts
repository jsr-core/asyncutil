import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { ensurePromise } from "./ensure_promise.ts";

test("ensurePromise() returns the value if it is already a promise", async () => {
  const p = Promise.resolve(42);
  assertEquals(await ensurePromise(p), 42);
});

test("ensurePromise() returns a promise that resolves to the value", async () => {
  assertEquals(await ensurePromise(42), 42);
});
