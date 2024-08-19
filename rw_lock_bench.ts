import { RwLock as RwLock100 } from "jsr:@core/asyncutil@~1.0.0/rw-lock";
import { RwLock } from "./rw_lock.ts";

const length = 1_000;

Deno.bench({
  name: "current",
  fn: async () => {
    const rwLock = new RwLock(0);
    await Promise.all(Array.from({ length }).map(() => rwLock.lock(() => {})));
  },
  group: "RwLock#lock",
  baseline: true,
});

Deno.bench({
  name: "v1.0.0",
  fn: async () => {
    const rwLock = new RwLock100(0);
    await Promise.all(Array.from({ length }).map(() => rwLock.lock(() => {})));
  },
  group: "RwLock#lock",
});

Deno.bench({
  name: "current",
  fn: async () => {
    const rwLock = new RwLock(0);
    await Promise.all(Array.from({ length }).map(() => rwLock.rlock(() => {})));
  },
  group: "RwLock#rlock",
  baseline: true,
});

Deno.bench({
  name: "v1.0.0",
  fn: async () => {
    const rwLock = new RwLock100(0);
    await Promise.all(Array.from({ length }).map(() => rwLock.rlock(() => {})));
  },
  group: "RwLock#rlock",
});
