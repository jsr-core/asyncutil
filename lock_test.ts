import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { delay } from "https://deno.land/std@0.86.0/async/mod.ts";
import { promiseState } from "./state.ts";
import { Lock } from "./lock.ts";

Deno.test("lock.acquire() acquire lock and lock.release() release lock", () => {
  const lock = new Lock();
  assertEquals(lock.locked(), false);
  lock.acquire();
  assertEquals(lock.locked(), true);
  lock.release();
  assertEquals(lock.locked(), false);
});

Deno.test("lock.release() throws an error if lock is not locked", () => {
  const lock = new Lock();
  assertThrows(() => lock.release(), Error, "The lock is not locked");
});

Deno.test(
  "Combination behaviors of lock.acquire()/lock.release()",
  async () => {
    const lock = new Lock();

    assertEquals(lock.locked(), false);

    const fst = lock.acquire();
    const snd = lock.acquire();
    const thd = lock.acquire();
    assertEquals(lock.locked(), true);
    assertEquals(await promiseState(fst), "fulfilled");
    assertEquals(await promiseState(snd), "pending");
    assertEquals(await promiseState(thd), "pending");

    lock.release();
    assertEquals(lock.locked(), true);
    assertEquals(await promiseState(fst), "fulfilled");
    assertEquals(await promiseState(snd), "fulfilled");
    assertEquals(await promiseState(thd), "pending");

    lock.release();
    assertEquals(lock.locked(), true);
    assertEquals(await promiseState(fst), "fulfilled");
    assertEquals(await promiseState(snd), "fulfilled");
    assertEquals(await promiseState(thd), "fulfilled");

    lock.release();
    assertEquals(lock.locked(), false);
  },
);

Deno.test("lock.with() invokes callback in exclusive way", async () => {
  const lock = new Lock();
  const ns = {
    a: "",
  };
  await lock.with(() => {
    ns.a = "a";
  });
  assertEquals(ns.a, "a");
});

Deno.test(
  "lock.with() invokes callback asynchronously in exclusive way",
  async () => {
    const lock = new Lock();
    const ns = {
      a: "",
    };
    await lock.with(async () => {
      ns.a = "a";
      await delay(1);
      ns.a = "b";
    });
    assertEquals(ns.a, "b");
  },
);
