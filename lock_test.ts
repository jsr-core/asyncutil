import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { AsyncValue } from "./async_value.ts";
import { Lock } from "./lock.ts";

test(
  "Lock Processing over multiple event loops is not atomic",
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
  "Lock Processing over multiple event loops is not atomic, but can be changed to atomic by using Lock",
  async () => {
    const count = new Lock(new AsyncValue(0));
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
  "Lock 'lock' should allow only one operation at a time",
  async () => {
    let noperations = 0;
    const results: number[] = [];
    const count = new Lock(new AsyncValue(0));
    const operation = () => {
      return count.lock(async (count) => {
        noperations += 1;
        results.push(noperations);
        const v = await count.get();
        await count.set(v + 1);
        noperations -= 1;
      });
    };
    await Promise.all([...Array(10)].map(() => operation()));
    assertEquals(noperations, 0);
    assertEquals(results, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  },
);
