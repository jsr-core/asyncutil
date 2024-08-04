import { delay } from "@std/async/delay";
import { assertEquals, assertRejects } from "@std/assert";
import { promiseState } from "./promise_state.ts";
import { Stack } from "./stack.ts";

Deno.test("Stack", async (t) => {
  await t.step("'pop' returns pushed items", async () => {
    const q = new Stack<number>();
    q.push(1);
    q.push(2);
    q.push(3);
    assertEquals(await q.pop(), 3);
    assertEquals(await q.pop(), 2);
    assertEquals(await q.pop(), 1);
  });

  await t.step("'pop' waits for an item is pushed", async () => {
    const q = new Stack<number>();
    const popper = q.pop();
    assertEquals(await promiseState(popper), "pending");
    q.push(1);
    assertEquals(await promiseState(popper), "fulfilled");
    assertEquals(await popper, 1);
  });

  await t.step("'pop' with non-aborted signal", async () => {
    const controller = new AbortController();
    const q = new Stack<number>();
    const popper = q.pop({ signal: controller.signal });
    assertEquals(await promiseState(popper), "pending");
  });

  await t.step("'pop' with signal aborted after delay", async () => {
    const controller = new AbortController();
    const q = new Stack<number>();
    const reason = new Error("Aborted");

    delay(100).then(() => controller.abort(reason));

    await assertRejects(
      () => q.pop({ signal: controller.signal }),
      Error,
      "Aborted",
    );
  });

  await t.step("'pop' with signal already aborted", async () => {
    const controller = new AbortController();
    const q = new Stack<number>();
    const reason = new Error("Aborted");

    controller.abort(reason);

    await assertRejects(
      () => q.pop({ signal: controller.signal }),
      Error,
      "Aborted",
    );
  });
});
