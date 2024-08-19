import { Semaphore as Semaphore100 } from "jsr:@core/asyncutil@~1.0.0/semaphore";
import { Semaphore } from "./semaphore.ts";

const length = 1_000;

Deno.bench({
  name: "current",
  fn: async () => {
    const semaphore = new Semaphore(10);
    await Promise.all(
      Array.from({ length }).map(() => semaphore.lock(() => {})),
    );
  },
  group: "Semaphore#lock",
  baseline: true,
});

Deno.bench({
  name: "v1.0.0",
  fn: async () => {
    const semaphore = new Semaphore100(10);
    await Promise.all(
      Array.from({ length }).map(() => semaphore.lock(() => {})),
    );
  },
  group: "Semaphore#lock",
});
