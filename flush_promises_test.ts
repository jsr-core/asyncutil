import { test } from "@cross/test";
import { assertEquals } from "@std/assert";
import { flushPromises } from "./flush_promises.ts";

test(
  "flushPromises() flushes all pending promises in the microtask queue",
  async () => {
    let count = 0;
    Array.from({ length: 5 }).forEach(() => {
      Promise.resolve()
        .then(() => count++)
        .then(() => count++);
    });
    assertEquals(count, 0);
    await flushPromises();
    assertEquals(count, 10);
  },
);
