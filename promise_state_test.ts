import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { promiseState } from "./promise_state.ts";

test(
  "promiseState() returns 'fulfilled' for resolved promise",
  async () => {
    const p = Promise.resolve("Resolved promise");
    assertEquals(await promiseState(p), "fulfilled");
  },
);

test(
  "promiseState() returns 'rejected' for rejected promise",
  async () => {
    const p = Promise.reject("Rejected promise");
    p.catch(() => undefined); // Avoid 'Uncaught (in promise) Rejected promise'
    assertEquals(await promiseState(p), "rejected");
  },
);

test(
  "promiseState() returns 'pending' for not resolved promise",
  async () => {
    const p = new Promise(() => undefined);
    assertEquals(await promiseState(p), "pending");
  },
);

test("promiseState() returns refreshed status", async () => {
  const { promise, resolve } = Promise.withResolvers<void>();
  const p = (async () => {
    await promise;
  })();
  assertEquals(await promiseState(p), "pending");
  resolve();
  assertEquals(await promiseState(p), "fulfilled");
});
