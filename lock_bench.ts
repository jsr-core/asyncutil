import { Lock as Lock100 } from "jsr:@core/asyncutil@~1.0.0/lock";
import { Lock } from "./lock.ts";

const length = 1_000;

Deno.bench({
  name: "current",
  fn: async () => {
    const lock = new Lock(0);
    await Promise.all(Array.from({ length }).map(() => lock.lock(() => {})));
  },
  group: "Lock#lock",
  baseline: true,
});

Deno.bench({
  name: "v1.0.0",
  fn: async () => {
    const lock = new Lock100(0);
    await Promise.all(Array.from({ length }).map(() => lock.lock(() => {})));
  },
  group: "Lock#lock",
});
