import { Queue as Queue100 } from "jsr:@core/asyncutil@~1.0.0/queue";
import { Queue } from "./queue.ts";

const length = 1_000;

Deno.bench({
  name: "current",
  fn: async () => {
    const queue = new Queue();
    Array
      .from({ length })
      .forEach(() => queue.push(1));
    await Promise.all(Array.from({ length }).map(() => queue.pop()));
  },
  group: "Queue#push/pop",
  baseline: true,
});

Deno.bench({
  name: "v1.0.0",
  fn: async () => {
    const queue = new Queue100();
    Array
      .from({ length })
      .forEach(() => queue.push(1));
    await Promise.allSettled(Array.from({ length }).map(() => queue.pop()));
  },
  group: "Queue#push/pop",
});
