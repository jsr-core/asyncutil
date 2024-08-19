import { Notify as Notify100 } from "jsr:@core/asyncutil@~1.0.0/notify";
import { Notify } from "./notify.ts";

const length = 1_000;

Deno.bench({
  name: "current",
  fn: async () => {
    const notify = new Notify();
    const waiter = Promise.all(
      Array.from({ length }).map(async () => {
        await notify.notified();
      }),
    );
    notify.notifyAll();
    await waiter;
  },
  group: "Notify#notifyAll",
  baseline: true,
});

Deno.bench({
  name: "v1.0.0",
  fn: async () => {
    const notify = new Notify100();
    const waiter = Promise.all(
      Array.from({ length }).map(async () => {
        await notify.notified();
      }),
    );
    notify.notifyAll();
    await waiter;
  },
  group: "Notify#notifyAll",
});

Deno.bench({
  name: "current",
  fn: async () => {
    const notify = new Notify();
    const waiter = Promise.all(
      Array.from({ length }).map(async () => {
        await notify.notified();
      }),
    );
    Array
      .from({ length: length }, () => notify.notify())
      .forEach(() => notify.notify());
    await waiter;
  },
  group: "Notify#notify",
  baseline: true,
});

Deno.bench({
  name: "v1.0.0",
  fn: async () => {
    const notify = new Notify100();
    const waiter = Promise.all(
      Array.from({ length }).map(async () => {
        await notify.notified();
      }),
    );
    Array
      .from({ length: length })
      .forEach(() => notify.notify());
    await waiter;
  },
  group: "Notify#notify",
});
