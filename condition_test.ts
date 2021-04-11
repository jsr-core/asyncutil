import { assertEquals, assertThrows, delay } from "./deps_test.ts";
import { promiseState } from "./state.ts";
import { Condition } from "./condition.ts";

Deno.test("cond.acquire() acquire lock and cond.release() release lock", () => {
  const cond = new Condition();
  assertEquals(cond.locked(), false);
  cond.acquire();
  assertEquals(cond.locked(), true);
  cond.release();
  assertEquals(cond.locked(), false);
});

Deno.test("cond.release() throws an error if lock is not locked", () => {
  const cond = new Condition();
  assertThrows(() => cond.release(), Error, "The lock is not locked");
});

Deno.test(
  "Combination behaviors of cond.acquire()/cond.release()",
  async () => {
    const cond = new Condition();

    assertEquals(cond.locked(), false);

    const fst = cond.acquire();
    const snd = cond.acquire();
    const thd = cond.acquire();
    assertEquals(cond.locked(), true);
    assertEquals(await promiseState(fst), "fulfilled");
    assertEquals(await promiseState(snd), "pending");
    assertEquals(await promiseState(thd), "pending");

    cond.release();
    assertEquals(cond.locked(), true);
    assertEquals(await promiseState(fst), "fulfilled");
    assertEquals(await promiseState(snd), "fulfilled");
    assertEquals(await promiseState(thd), "pending");

    cond.release();
    assertEquals(cond.locked(), true);
    assertEquals(await promiseState(fst), "fulfilled");
    assertEquals(await promiseState(snd), "fulfilled");
    assertEquals(await promiseState(thd), "fulfilled");

    cond.release();
    assertEquals(cond.locked(), false);
  },
);

Deno.test(
  "cond.with() invokes callback asynchronously in exclusive way",
  async () => {
    const cond = new Condition();
    const ns = {
      a: "",
    };
    await cond.with(async () => {
      ns.a = "a";
      await delay(1);
      ns.a = "b";
    });
    assertEquals(ns.a, "b");
  },
);

Deno.test("cond.wait() wait until cond.notify() is invoked", async () => {
  const cond = new Condition();
  await cond.with(async () => {
    const waiter = cond.wait();
    assertEquals(await promiseState(waiter), "pending");
    await cond.with(() => {
      cond.notify();
    });
    assertEquals(await promiseState(waiter), "fulfilled");
  });
});

Deno.test(
  "cond.wait_for() wait until cond.notify() is invoked and predicate returns true",
  async () => {
    const cond = new Condition();
    let result = false;
    const pred = () => result;
    await cond.with(async () => {
      const waiter = cond.wait_for(pred);
      assertEquals(await promiseState(waiter), "pending");
      await cond.with(() => {
        cond.notify();
      });
      assertEquals(await promiseState(waiter), "pending");
      await cond.with(() => {
        result = true;
        cond.notify();
      });
      assertEquals(await promiseState(waiter), "fulfilled");
    });
  },
);

Deno.test("cond.notify() wake up n waiting tasks", async () => {
  const cond = new Condition();
  const result = {
    fst: false,
    snd: false,
    thd: false,
  };
  const tasks = [
    cond.with(async () => {
      await cond.wait();
      result.fst = true;
    }),
    cond.with(async () => {
      await cond.wait();
      result.snd = true;
    }),
    cond.with(async () => {
      await cond.wait();
      result.thd = true;
    }),
  ];
  assertEquals(await promiseState(tasks[0]), "pending");
  assertEquals(await promiseState(tasks[1]), "pending");
  assertEquals(await promiseState(tasks[2]), "pending");
  assertEquals(result, {
    fst: false,
    snd: false,
    thd: false,
  });
  await cond.with(() => {
    cond.notify(2);
  });
  assertEquals(await promiseState(tasks[0]), "fulfilled");
  assertEquals(await promiseState(tasks[1]), "fulfilled");
  assertEquals(await promiseState(tasks[2]), "pending");
  assertEquals(result, {
    fst: true,
    snd: true,
    thd: false,
  });
  await cond.with(() => {
    cond.notify();
  });
  assertEquals(await promiseState(tasks[0]), "fulfilled");
  assertEquals(await promiseState(tasks[1]), "fulfilled");
  assertEquals(await promiseState(tasks[2]), "fulfilled");
  assertEquals(result, {
    fst: true,
    snd: true,
    thd: true,
  });
});
