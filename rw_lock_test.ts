import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { promiseState } from "./promise_state.ts";
import { AsyncValue } from "./async_value.ts";
import { RwLock } from "./rw_lock.ts";

test(
  "RwLock Processing over multiple event loops is not atomic",
  async () => {
    const count = new AsyncValue(0);
    const operation = async () => {
      const v = await count.get();
      await count.set(v + 1);
    };
    await Promise.all([...Array(10)].map(() => operation()));
    assertEquals(await count.get(), 1);
  },
);

test(
  "RwLock Processing over multiple event loops is not atomic, but can be changed to atomic by using RwLock",
  async () => {
    const count = new RwLock(new AsyncValue(0));
    const operation = () => {
      return count.lock(async (count) => {
        const v = await count.get();
        await count.set(v + 1);
      });
    };
    await Promise.all([...Array(10)].map(() => operation()));
    assertEquals(await count.lock((v) => v.get()), 10);
  },
);

test(
  "RwLock 'lock' should allow only one writer at a time",
  async () => {
    let nwriters = 0;
    const results: number[] = [];
    const count = new RwLock(new AsyncValue(0));
    const writer = () => {
      return count.lock(async (count) => {
        nwriters += 1;
        results.push(nwriters);
        await count.set(await count.get() + 1);
        nwriters -= 1;
      });
    };
    await Promise.all([...Array(10)].map(() => writer()));
    assertEquals(nwriters, 0);
    assertEquals(results, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  },
);

test(
  "RwLock 'rlock' should allow multiple readers at a time",
  async () => {
    let nreaders = 0;
    const results: number[] = [];
    const count = new RwLock(new AsyncValue(0));
    const reader = () => {
      return count.rlock(async (count) => {
        nreaders += 1;
        results.push(nreaders);
        assertEquals(await count.get(), 0);
        nreaders -= 1;
      });
    };
    await Promise.all([...Array(10)].map(() => reader()));
    assertEquals(nreaders, 0);
    assertEquals(results, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  },
);

test(
  "RwLock 'lock' should block until all readers are done",
  async () => {
    const count = new RwLock(new AsyncValue(0));
    const { promise, resolve } = Promise.withResolvers<void>();
    const writer = () => {
      return count.lock(() => {
        // Do nothing
      });
    };
    const reader = () => {
      return count.rlock(async () => {
        await promise;
      });
    };
    const r = reader();
    const w = writer();
    assertEquals(await promiseState(r), "pending");
    assertEquals(await promiseState(w), "pending");
    resolve();
    assertEquals(await promiseState(r), "fulfilled");
    assertEquals(await promiseState(w), "fulfilled");
  },
);

test(
  "RwLock 'rlock' should block until all writers are done",
  async () => {
    const count = new RwLock(new AsyncValue(0));
    const { promise, resolve } = Promise.withResolvers<void>();
    const writer = () => {
      return count.lock(async () => {
        await promise;
      });
    };
    const reader = () => {
      return count.rlock(() => {
        // Do nothing
      });
    };
    const w = writer();
    const r = reader();
    assertEquals(await promiseState(w), "pending");
    assertEquals(await promiseState(r), "pending");
    resolve();
    assertEquals(await promiseState(w), "fulfilled");
    assertEquals(await promiseState(r), "fulfilled");
  },
);
