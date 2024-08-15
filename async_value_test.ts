import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { AsyncValue } from "./async_value.ts";

test(
  "AsyncValue 'get' returns a promise that resolves to the value set by 'set'",
  async () => {
    const v = new AsyncValue(0);
    assertEquals(await v.get(), 0);
    await v.set(1);
    assertEquals(await v.get(), 1);
  },
);
