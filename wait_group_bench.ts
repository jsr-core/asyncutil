import { WaitGroup as WaitGroup100 } from "jsr:@core/asyncutil@~1.0.0/wait-group";
import { WaitGroup } from "./wait_group.ts";

const length = 1_000;

Deno.bench({
  name: "current",
  fn: async () => {
    const wg = new WaitGroup();
    const waiter = wg.wait();
    Array.from({ length }).forEach(() => wg.add(1));
    Array.from({ length }).forEach(() => wg.done());
    await waiter;
  },
  group: "WaitGroup#wait",
  baseline: true,
});

Deno.bench({
  name: "v1.0.0",
  fn: async () => {
    const wg = new WaitGroup100();
    const waiter = wg.wait();
    Array.from({ length }).forEach(() => wg.add(1));
    Array.from({ length }).forEach(() => wg.done());
    await waiter;
  },
  group: "WaitGroup#wait",
});
