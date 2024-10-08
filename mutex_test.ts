import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { AsyncValue } from "./async_value.ts";
import { Mutex } from "./mutex.ts";

test(
  "Mutex Processing over multiple event loops is not atomic",
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
  "Mutex Processing over multiple event loops is not atomic, but can be changed to atomic by using Mutex",
  async () => {
    const mu = new Mutex();
    const count = new AsyncValue(0);
    const operation = async () => {
      using _lock = await mu.acquire();
      const v = await count.get();
      await count.set(v + 1);
    };
    await Promise.all([...Array(10)].map(() => operation()));
    assertEquals(await count.get(), 10);
  },
);
