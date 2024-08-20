import { test } from "@cross/test";
import { delay } from "@std/async/delay";
import { assertEquals, assertRejects } from "@std/assert";
import { flushPromises } from "./flush_promises.ts";
import { peekPromiseState } from "./peek_promise_state.ts";
import { Stack } from "./stack.ts";

test("Stack 'pop' returns pushed items", async () => {
  const q = new Stack<number>();
  q.push(1);
  q.push(2);
  q.push(3);
  assertEquals(await q.pop(), 3);
  assertEquals(await q.pop(), 2);
  assertEquals(await q.pop(), 1);
});

test("Stack 'pop' waits for an item is pushed", async () => {
  const q = new Stack<number>();
  const popper = q.pop();
  await flushPromises();
  assertEquals(await peekPromiseState(popper), "pending");
  q.push(1);
  await flushPromises();
  assertEquals(await peekPromiseState(popper), "fulfilled");
  assertEquals(await popper, 1);
});

test("Stack 'pop' with non-aborted signal", async () => {
  const controller = new AbortController();
  const q = new Stack<number>();
  const popper = q.pop({ signal: controller.signal });
  await flushPromises();
  assertEquals(await peekPromiseState(popper), "pending");
});

test("Stack 'pop' with signal aborted after delay", async () => {
  const controller = new AbortController();
  const q = new Stack<number>();
  const reason = new Error("Aborted");

  delay(100).then(() => controller.abort(reason));

  await assertRejects(
    () => q.pop({ signal: controller.signal }),
    Error,
    "Aborted",
  );
});

test("Stack 'pop' with signal already aborted", async () => {
  const controller = new AbortController();
  const q = new Stack<number>();
  const reason = new Error("Aborted");

  controller.abort(reason);

  await assertRejects(
    () => q.pop({ signal: controller.signal }),
    Error,
    "Aborted",
  );
});

test("Stack with falsy value is accepted", async () => {
  const q = new Stack<number>();
  const popper = q.pop();
  await flushPromises();
  assertEquals(await peekPromiseState(popper), "pending");
  q.push(0);
  await flushPromises();
  assertEquals(await peekPromiseState(popper), "fulfilled");
  assertEquals(await popper, 0);
});

test("Stack with null is accepted", async () => {
  const q = new Stack<null>();
  const popper = q.pop();
  await flushPromises();
  assertEquals(await peekPromiseState(popper), "pending");
  q.push(null);
  await flushPromises();
  assertEquals(await peekPromiseState(popper), "fulfilled");
  assertEquals(await popper, null);
});
