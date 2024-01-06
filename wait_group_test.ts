import { assertEquals } from "https://deno.land/std@0.211.0/assert/mod.ts";
import { delay } from "https://deno.land/std@0.211.0/async/delay.ts";
import { WaitGroup } from "./wait_group.ts";

Deno.test("WaitGroup", async (t) => {
  await t.step(
    "Ensure WaitGroup synchronizes multiple workers",
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
});
