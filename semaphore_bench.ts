import { Semaphore } from "./semaphore.ts";
import { Semaphore as Semaphore102 } from "jsr:@core/asyncutil@1.0.2/semaphore";

const sem = new Semaphore(5);
Deno.bench("Semaphore", async function () {
  const worker = () => {
    return sem.lock(async () => {
      // do nothing
    });
  };
  await Promise.all(Array.from({ length: 100 }).map(() => worker()));
});

const sem102 = new Semaphore102(5);
Deno.bench("Semaphore (1.0.2)", async function () {
  const worker = () => {
    return sem102.lock(async () => {
      // do nothing
    });
  };
  await Promise.all(Array.from({ length: 100 }).map(() => worker()));
});
