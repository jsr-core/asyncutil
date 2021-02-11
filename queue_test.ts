import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { promiseState } from "./state.ts";
import { Queue, QueueEmpty, QueueFull } from "./queue.ts";

Deno.test(
  "queue.put_nowait() put items into the queue and queue.get_nowait() return it",
  () => {
    const queue = new Queue<string>();
    queue.put_nowait("Hello");
    queue.put_nowait("World");
    assertEquals(queue.get_nowait(), "Hello");
    assertEquals(queue.get_nowait(), "World");
  },
);

Deno.test(
  "queue.get_nowait() throws QueueEmpty error if no item exists in queue",
  () => {
    const queue = new Queue<string>();
    assertThrows(() => queue.get_nowait(), QueueEmpty);
  },
);

Deno.test(
  "queue.put_nowait() throws QueueFull error if reached to the maxsize",
  () => {
    const queue = new Queue<string>(1);
    queue.put_nowait("Hello");
    assertThrows(() => queue.put_nowait("World"), QueueFull);
  },
);

Deno.test("queue.empty() returns true or false", () => {
  const queue = new Queue<string>();
  assertEquals(queue.empty(), true);
  queue.put_nowait("Hello");
  assertEquals(queue.empty(), false);
});

Deno.test("queue.full() returns true or false", () => {
  const queue = new Queue<string>(1);
  assertEquals(queue.full(), false);
  queue.put_nowait("Hello");
  assertEquals(queue.full(), true);
});

Deno.test("queue.qsize() returns the number of items", () => {
  const queue = new Queue<string>();
  assertEquals(queue.qsize(), 0);
  queue.put_nowait("Hello");
  assertEquals(queue.qsize(), 1);
  queue.put_nowait("World");
  assertEquals(queue.qsize(), 2);
});

Deno.test(
  "queue.put() waits until a free slot is available by queue.get_nowait()",
  async () => {
    const queue = new Queue<string>(2);
    queue.put_nowait("Hello");
    queue.put_nowait("World");
    const waiter = queue.put("Foo");
    assertEquals(await promiseState(waiter), "pending");
    assertEquals(queue.get_nowait(), "Hello");
    assertEquals(await promiseState(waiter), "fulfilled");
    assertEquals(queue.get_nowait(), "World");
    assertEquals(queue.get_nowait(), "Foo");
  },
);

Deno.test(
  "queue.put() waits until a free slot is available by queue.get()",
  async () => {
    const queue = new Queue<string>(2);
    queue.put_nowait("Hello");
    queue.put_nowait("World");
    const waiter = queue.put("Foo");
    assertEquals(await promiseState(waiter), "pending");
    assertEquals(await queue.get(), "Hello");
    assertEquals(await promiseState(waiter), "fulfilled");
    assertEquals(await queue.get(), "World");
    assertEquals(await queue.get(), "Foo");
  },
);

Deno.test(
  "queue.get() waits until an item is available by queue.put_nowait()",
  async () => {
    const queue = new Queue<string>();
    const waiter = queue.get();
    assertEquals(await promiseState(waiter), "pending");
    queue.put_nowait("Hello");
    assertEquals(await promiseState(waiter), "fulfilled");
    assertEquals(await waiter, "Hello");
  },
);

Deno.test(
  "queue.get() waits until an item is available by queue.put()",
  async () => {
    const queue = new Queue<string>();
    const waiter = queue.get();
    assertEquals(await promiseState(waiter), "pending");
    await queue.put("Hello");
    assertEquals(await promiseState(waiter), "fulfilled");
    assertEquals(await waiter, "Hello");
  },
);
