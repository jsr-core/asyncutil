import { promiseState } from "./promise_state.ts";

Deno.bench({
  name: "current",
  fn: async () => {
    await promiseState(Promise.resolve("fulfilled"));
  },
  group: "promiseState (fulfilled)",
  baseline: true,
});

Deno.bench({
  name: "current",
  fn: async () => {
    const p = Promise.reject("reject").catch(() => {});
    await promiseState(p);
  },
  group: "promiseState (rejected)",
  baseline: true,
});

Deno.bench({
  name: "current",
  fn: async () => {
    await promiseState(new Promise(() => {}));
  },
  group: "promiseState (pending)",
  baseline: true,
});
