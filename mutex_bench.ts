import { Mutex as Mutex100 } from "jsr:@core/asyncutil@~1.0.0/mutex";
import { Mutex } from "./mutex.ts";

const length = 1_000;

Deno.bench({
  name: "current",
  fn: async () => {
    const mutex = new Mutex();
    await Promise.all(
      Array.from({ length }).map(async () => {
        const lock = await mutex.acquire();
        lock[Symbol.dispose]();
      }),
    );
  },
  group: "Mutex#wait",
  baseline: true,
});

Deno.bench({
  name: "v1.0.0",
  fn: async () => {
    const mutex = new Mutex100();
    await Promise.all(
      Array.from({ length }).map(async () => {
        const lock = await mutex.acquire();
        lock[Symbol.dispose]();
      }),
    );
  },
  group: "Mutex#wait",
});
