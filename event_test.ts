import { assertEquals } from "https://deno.land/std@0.185.0/testing/asserts.ts";
import { promiseState } from "./state.ts";
import { Event } from "./event.ts";

Deno.test("event.wait() wait until other tasks call event.set()", async () => {
  const event = new Event();
  const waiter = event.wait();
  assertEquals(await promiseState(waiter), "pending");
  event.set();
  assertEquals(await promiseState(waiter), "fulfilled");
  assertEquals(await waiter, true);
});

Deno.test(
  "multiple event.wait() wait until other tasks call event.set()",
  async () => {
    const event = new Event();
    const waiter1 = event.wait();
    const waiter2 = event.wait();
    const waiter3 = event.wait();
    assertEquals(await promiseState(waiter1), "pending");
    assertEquals(await promiseState(waiter2), "pending");
    assertEquals(await promiseState(waiter3), "pending");
    event.set();
    assertEquals(await promiseState(waiter1), "fulfilled");
    assertEquals(await promiseState(waiter2), "fulfilled");
    assertEquals(await promiseState(waiter3), "fulfilled");
    assertEquals(await waiter1, true);
    assertEquals(await waiter2, true);
    assertEquals(await waiter3, true);
  },
);

Deno.test(
  "event.wait() return true immediately if event.set() is already invoked",
  async () => {
    const event = new Event();
    event.set();
    const waiter = event.wait();
    assertEquals(await promiseState(waiter), "fulfilled");
    assertEquals(await waiter, true);
  },
);

Deno.test("Invoking event.set() multiple times is safe", async () => {
  const event = new Event();
  event.set();
  event.set();
  event.set();
  const waiter = event.wait();
  assertEquals(await promiseState(waiter), "fulfilled");
  assertEquals(await waiter, true);
});

Deno.test("event.is_set() return true if the event is set", () => {
  const event = new Event();
  assertEquals(event.is_set(), false);
  event.set();
  assertEquals(event.is_set(), true);
});

Deno.test("event.clear() unset the event", async () => {
  const event = new Event();
  assertEquals(event.is_set(), false);
  event.set();
  assertEquals(event.is_set(), true);
  event.clear();
  assertEquals(event.is_set(), false);
  const waiter = event.wait();
  assertEquals(await promiseState(waiter), "pending");
  event.set();
  assertEquals(await promiseState(waiter), "fulfilled");
  assertEquals(await waiter, true);
});
