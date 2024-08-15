import { test } from "@cross/test";
import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { deadline, delay } from "@std/async";
import { WaitGroup } from "./wait_group.ts";

test(
  "WaitGroup Ensure WaitGroup synchronizes multiple workers",
  async () => {
    const wg = new WaitGroup();
    const workers = [];
    const results: string[] = [];
    for (let i = 0; i < 5; i++) {
      workers.push((async () => {
        wg.add(1);
        results.push(`before wait ${i}`);
        await delay(100);
        results.push(`after wait ${i}`);
        wg.done();
      })());
    }
    await wg.wait();
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
  "WaitGroup 'wait' with non-aborted signal",
  async () => {
    const controller = new AbortController();
    const wg = new WaitGroup();
    wg.add(1);
    await assertRejects(
      () => deadline(wg.wait({ signal: controller.signal }), 100),
      DOMException,
      "Signal timed out.",
    );
  },
);

test(
  "WaitGroup 'wait' with signal aborted after delay",
  async () => {
    const controller = new AbortController();
    const wg = new WaitGroup();
    wg.add(1);

    const reason = new Error("Aborted");
    delay(50).then(() => controller.abort(reason));

    await assertRejects(
      () => deadline(wg.wait({ signal: controller.signal }), 100),
      Error,
      "Aborted",
    );
  },
);

test(
  "WaitGroup 'wait' with already aborted signal",
  async () => {
    const controller = new AbortController();
    const wg = new WaitGroup();
    wg.add(1);

    const reason = new Error("Aborted");
    controller.abort(reason);

    await assertRejects(
      () => deadline(wg.wait({ signal: controller.signal }), 100),
      Error,
      "Aborted",
    );
  },
);

test(
  "WaitGroup 'add' throws RangeError if delta is not a safe integer",
  () => {
    const wg = new WaitGroup();
    assertThrows(() => wg.add(NaN), RangeError);
    assertThrows(() => wg.add(Infinity), RangeError);
    assertThrows(() => wg.add(-Infinity), RangeError);
    assertThrows(() => wg.add(1.1), RangeError);
  },
);
