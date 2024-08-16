import { test } from "@cross/test";
import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { delay } from "@std/async";
import { Barrier } from "./barrier.ts";
import { deadline } from "./_testutil.ts";

test(
  "Barrier 'wait' waits until the number of waiters reached the size specified to the barrier",
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

test(
  "Barrier 'wait' with non-aborted signal",
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

test(
  "Barrier 'wait' with signal aborted after delay",
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

test(
  "Barrier 'wait' with already aborted signal",
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

test(
  "Barrier throws RangeError if size is not a positive safe integer",
  () => {
    assertThrows(() => new Barrier(NaN), RangeError);
    assertThrows(() => new Barrier(Infinity), RangeError);
    assertThrows(() => new Barrier(-Infinity), RangeError);
    assertThrows(() => new Barrier(-1), RangeError);
    assertThrows(() => new Barrier(1.1), RangeError);
    assertThrows(() => new Barrier(0), RangeError);
  },
);
