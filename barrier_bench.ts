import { Barrier as Barrier100 } from "jsr:@core/asyncutil@~1.0.0/barrier";
import { Barrier } from "./barrier.ts";

const length = 1_000;

Deno.bench({
  name: "current",
  fn: async () => {
    const barrier = new Barrier(length);
    await Promise.all(Array.from({ length }).map(() => barrier.wait()));
  },
  group: "Barrier#wait",
  baseline: true,
});

Deno.bench({
  name: "v1.0.0",
  fn: async () => {
    const barrier = new Barrier100(length);
    await Promise.all(Array.from({ length }).map(() => barrier.wait()));
  },
  group: "Barrier#wait",
});
