import { test } from "@cross/test";
import { delay } from "@std/async/delay";
import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { flushPromises } from "./flush_promises.ts";
import { peekPromiseState } from "./peek_promise_state.ts";
import { Notify } from "./notify.ts";

test("Notify 'notify' wakes up a single waiter", async () => {
  const notify = new Notify();
  const waiter1 = notify.notified();
  const waiter2 = notify.notified();
  assertEquals(notify.waiterCount, 2);

  notify.notify();
  await flushPromises();
  assertEquals(notify.waiterCount, 1);
  assertEquals(await peekPromiseState(waiter1), "fulfilled");
  assertEquals(await peekPromiseState(waiter2), "pending");

  notify.notify();
  await flushPromises();
  assertEquals(notify.waiterCount, 0);
  assertEquals(await peekPromiseState(waiter1), "fulfilled");
  assertEquals(await peekPromiseState(waiter2), "fulfilled");
});

test("Notify 'notify' wakes up a multiple waiters", async () => {
  const notify = new Notify();
  const waiter1 = notify.notified();
  const waiter2 = notify.notified();
  const waiter3 = notify.notified();
  const waiter4 = notify.notified();
  const waiter5 = notify.notified();
  assertEquals(notify.waiterCount, 5);

  notify.notify(2);
  await flushPromises();
  assertEquals(notify.waiterCount, 3);
  assertEquals(await peekPromiseState(waiter1), "fulfilled");
  assertEquals(await peekPromiseState(waiter2), "fulfilled");
  assertEquals(await peekPromiseState(waiter3), "pending");
  assertEquals(await peekPromiseState(waiter4), "pending");
  assertEquals(await peekPromiseState(waiter5), "pending");

  notify.notify(2);
  await flushPromises();
  assertEquals(notify.waiterCount, 1);
  assertEquals(await peekPromiseState(waiter1), "fulfilled");
  assertEquals(await peekPromiseState(waiter2), "fulfilled");
  assertEquals(await peekPromiseState(waiter3), "fulfilled");
  assertEquals(await peekPromiseState(waiter4), "fulfilled");
  assertEquals(await peekPromiseState(waiter5), "pending");

  notify.notify(2);
  await flushPromises();
  assertEquals(notify.waiterCount, 0);
  assertEquals(await peekPromiseState(waiter1), "fulfilled");
  assertEquals(await peekPromiseState(waiter2), "fulfilled");
  assertEquals(await peekPromiseState(waiter3), "fulfilled");
  assertEquals(await peekPromiseState(waiter4), "fulfilled");
  assertEquals(await peekPromiseState(waiter5), "fulfilled");
});

test("Notify 'notifyAll' wakes up all waiters", async () => {
  const notify = new Notify();
  const waiter1 = notify.notified();
  const waiter2 = notify.notified();
  assertEquals(notify.waiterCount, 2);

  notify.notifyAll();
  await flushPromises();
  assertEquals(notify.waiterCount, 0);
  assertEquals(await peekPromiseState(waiter1), "fulfilled");
  assertEquals(await peekPromiseState(waiter2), "fulfilled");
});

test(
  "Notify 'notified' with non-aborted signal",
  async () => {
    const controller = new AbortController();
    const notify = new Notify();

    const waiter = notify.notified({ signal: controller.signal });
    assertEquals(await peekPromiseState(waiter), "pending");
  },
);

test(
  "Notify 'notified' with signal aborted after delay",
  async () => {
    const controller = new AbortController();
    const notify = new Notify();
    const reason = new Error("Aborted");

    delay(100).then(() => controller.abort(reason));
    await assertRejects(
      () => notify.notified({ signal: controller.signal }),
      Error,
      "Aborted",
    );
  },
);

test(
  "Notify 'notified' with already aborted signal",
  async () => {
    const controller = new AbortController();
    const notify = new Notify();
    const reason = new Error("Aborted");

    controller.abort(reason);
    await assertRejects(
      () => notify.notified({ signal: controller.signal }),
      Error,
      "Aborted",
    );
  },
);

test(
  "Notify 'notify' throws RangeError if size is not a positive safe integer",
  () => {
    const notify = new Notify();
    assertThrows(() => notify.notify(NaN), RangeError);
    assertThrows(() => notify.notify(Infinity), RangeError);
    assertThrows(() => notify.notify(-Infinity), RangeError);
    assertThrows(() => notify.notify(-1), RangeError);
    assertThrows(() => notify.notify(1.1), RangeError);
    assertThrows(() => notify.notify(0), RangeError);
  },
);
