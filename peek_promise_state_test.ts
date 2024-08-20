import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { flushPromises } from "./flush_promises.ts";
import { peekPromiseState } from "./peek_promise_state.ts";

test(
  "peekPromiseState() returns 'fulfilled' for resolved promise",
  async () => {
    const p = Promise.resolve("Resolved promise");
    assertEquals(await peekPromiseState(p), "fulfilled");
  },
);

test(
  "peekPromiseState() returns 'rejected' for rejected promise",
  async () => {
    const p = Promise.reject("Rejected promise");
    p.catch(() => undefined); // Avoid 'Uncaught (in promise) Rejected promise'
    assertEquals(await peekPromiseState(p), "rejected");
  },
);

test(
  "peekPromiseState() returns 'pending' for not resolved promise",
  async () => {
    const p = new Promise(() => undefined);
    assertEquals(await peekPromiseState(p), "pending");
  },
);

test("peekPromiseState() return the current state of the promise", async () => {
  const p = Promise.resolve<void>(undefined)
    .then(() => {})
    .then(() => {});
  assertEquals(await peekPromiseState(p), "pending");
  await flushPromises();
  assertEquals(await peekPromiseState(p), "fulfilled");
});
