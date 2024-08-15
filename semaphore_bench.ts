import { Semaphore } from "./semaphore.ts";

const sem = new Semaphore(5);

Deno.bench("Semaphore", async function () {
  const worker = () => {
    return sem.lock(async () => {
      // do nothing
    });
  };
  await Promise.all(Array.from({ length: 100 }).map(() => worker()));
});
