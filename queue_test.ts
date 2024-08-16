import { test } from "@cross/test";
import { delay } from "@std/async/delay";
import { assertEquals, assertRejects } from "@std/assert";
import { promiseState } from "./promise_state.ts";
import { Queue } from "./queue.ts";

test("Queue 'pop' returns pushed items", async () => {
  const q = new Queue<number>();
  q.push(1);
  q.push(2);
  q.push(3);
  assertEquals(await q.pop(), 1);
  assertEquals(await q.pop(), 2);
  assertEquals(await q.pop(), 3);
});

test("Queue 'pop' waits for an item is pushed", async () => {
  const q = new Queue<number>();
  const popper = q.pop();
  assertEquals(await promiseState(popper), "pending");
  q.push(1);
  assertEquals(await promiseState(popper), "fulfilled");
  assertEquals(await popper, 1);
});

test("Queue 'pop' with non-aborted signal", async () => {
  const controller = new AbortController();
  const q = new Queue<number>();
  const popper = q.pop({ signal: controller.signal });
  assertEquals(await promiseState(popper), "pending");
});

test("Queue 'pop' with signal aborted after delay", async () => {
  const controller = new AbortController();
  const q = new Queue<number>();
  const reason = new Error("Aborted");

  delay(100).then(() => controller.abort(reason));

  await assertRejects(
    () => q.pop({ signal: controller.signal }),
    Error,
    "Aborted",
  );
});

test("Queue 'pop' with signal already aborted", async () => {
  const controller = new AbortController();
  const q = new Queue<number>();
  const reason = new Error("Aborted");

  controller.abort(reason);

  await assertRejects(
    () => q.pop({ signal: controller.signal }),
    Error,
    "Aborted",
  );
});

test("Queue with falsy value is accepted", async () => {
  const q = new Queue<number>();
  const popper = q.pop();
  assertEquals(await promiseState(popper), "pending");
  q.push(0);
  assertEquals(await promiseState(popper), "fulfilled");
  assertEquals(await popper, 0);
});

test("Queue with null is accepted", async () => {
  const q = new Queue<null>();
  const popper = q.pop();
  assertEquals(await promiseState(popper), "pending");
  q.push(null);
  assertEquals(await promiseState(popper), "fulfilled");
  assertEquals(await popper, null);
});
