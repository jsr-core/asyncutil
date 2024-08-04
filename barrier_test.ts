import { assertEquals, assertRejects } from "@std/assert";
import { deadline, delay } from "@std/async";
import { Barrier } from "./barrier.ts";

Deno.test("Barrier", async (t) => {
  await t.step(
    "'wait' waits until the number of waiters reached the size specified to the barrier",
    async () => {
      const barrier = new Barrier(5);
      const workers = [];
      const results: string[] = [];
      for (let i = 0; i < 5; i++) {
        workers.push((async () => {
          results.push(`before wait ${i}`);
          await barrier.wait();
          results.push(`after wait ${i}`);
        })());
      }
      await Promise.all(workers);
      assertEquals(results, [
        "before wait 0",
        "before wait 1",
        "before wait 2",
        "before wait 3",
        "before wait 4",
        "after wait 0",
        "after wait 1",
        "after wait 2",
        "after wait 3",
        "after wait 4",
      ]);
    },
  );

  await t.step(
    "'wait' with non-aborted signal",
    async () => {
      const controller = new AbortController();
      const barrier = new Barrier(2);

      await assertRejects(
        () => deadline(barrier.wait({ signal: controller.signal }), 100),
        DOMException,
        "Signal timed out.",
      );
    },
  );

  await t.step(
    "'wait' with signal aborted after delay",
    async () => {
      const controller = new AbortController();
      const barrier = new Barrier(2);
      const reason = new Error("Aborted");

      delay(50).then(() => controller.abort(reason));

      await assertRejects(
        () => deadline(barrier.wait({ signal: controller.signal }), 100),
        Error,
        "Aborted",
      );
    },
  );

  await t.step(
    "'wait' with already aborted signal",
    async () => {
      const controller = new AbortController();
      const barrier = new Barrier(2);
      const reason = new Error("Aborted");

      controller.abort(reason);

      await assertRejects(
        () => deadline(barrier.wait({ signal: controller.signal }), 100),
        Error,
        "Aborted",
      );
    },
  );
});
