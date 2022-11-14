import { Semaphore } from "../mod.ts";
import { delay } from "https://deno.land/std@0.164.0/async/mod.ts";

const sem = new Semaphore(3);
let nWorkers = 0;

const worker = async () => {
  await sem.with(async () => {
    nWorkers += 1;
    console.log(`${nWorkers} workers are working...`);
    await delay(100);
    console.log(`Complete`);
    nWorkers -= 1;
  });
};

const workers = [
  worker(),
  worker(),
  worker(),
  worker(),
  worker(),
  worker(),
  worker(),
  worker(),
  worker(),
  worker(),
];
await Promise.all(workers);
// 1 workers are working...
// 2 workers are working...
// 3 workers are working...
// Complete
// 3 workers are working...
// Complete
// 3 workers are working...
// Complete
// 3 workers are working...
// Complete
// 3 workers are working...
// Complete
// 3 workers are working...
// Complete
// 3 workers are working...
// Complete
// 3 workers are working...
// Complete
// Complete
// Complete
