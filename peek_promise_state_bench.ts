import { peekPromiseState } from "./peek_promise_state.ts";

Deno.bench({
  name: "current",
  fn: async () => {
    await peekPromiseState(Promise.resolve("fulfilled"));
  },
  group: "peekPromiseState (fulfilled)",
  baseline: true,
});

Deno.bench({
  name: "current",
  fn: async () => {
    const p = Promise.reject("reject").catch(() => {});
    await peekPromiseState(p);
  },
  group: "peekPromiseState (rejected)",
  baseline: true,
});

Deno.bench({
  name: "current",
  fn: async () => {
    await peekPromiseState(new Promise(() => {}));
  },
  group: "peekPromiseState (pending)",
  baseline: true,
});
