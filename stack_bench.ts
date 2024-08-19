import { Stack as Stack100 } from "jsr:@core/asyncutil@~1.0.0/stack";
import { Stack } from "./stack.ts";

const length = 1_000;

Deno.bench({
  name: "current",
  fn: async () => {
    const stack = new Stack();
    Array
      .from({ length })
      .forEach(() => stack.push(1));
    await Promise.all(Array.from({ length }).map(() => stack.pop()));
  },
  group: "Stack#push/pop",
  baseline: true,
});

Deno.bench({
  name: "v1.0.0",
  fn: async () => {
    const stack = new Stack100();
    Array
      .from({ length })
      .forEach(() => stack.push(1));
    await Promise.allSettled(Array.from({ length }).map(() => stack.pop()));
  },
  group: "Stack#push/pop",
});
