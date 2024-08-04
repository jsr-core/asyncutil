import { delay } from "@std/async/delay";
import { assertEquals, assertRejects } from "@std/assert";
import { promiseState } from "./promise_state.ts";
import { Notify } from "./notify.ts";

Deno.test("Notify", async (t) => {
  await t.step("'notify' wakes up a single waiter", async () => {
    const notify = new Notify();
    const waiter1 = notify.notified();
    const waiter2 = notify.notified();

    notify.notify();
    assertEquals(await promiseState(waiter1), "fulfilled");
    assertEquals(await promiseState(waiter2), "pending");

    notify.notify();
    assertEquals(await promiseState(waiter1), "fulfilled");
    assertEquals(await promiseState(waiter2), "fulfilled");
  });

  await t.step("'notifyAll' wakes up all waiters", async () => {
    const notify = new Notify();
    const waiter1 = notify.notified();
    const waiter2 = notify.notified();
    notify.notifyAll();
    assertEquals(await promiseState(waiter1), "fulfilled");
    assertEquals(await promiseState(waiter2), "fulfilled");
  });

  await t.step(
    "'notified' with non-aborted signal",
    async () => {
      const controller = new AbortController();
      const notify = new Notify();

      const waiter = notify.notified({ signal: controller.signal });
      assertEquals(await promiseState(waiter), "pending");
    },
  );

  await t.step(
    "'notified' with signal aborted after delay",
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

  await t.step(
    "'notified' with already aborted signal",
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
});
