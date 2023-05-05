import { Lock } from "../mod.ts";
import { delay } from "https://deno.land/std@0.186.0/async/mod.ts";

const lock = new Lock();

const task1 = async () => {
  await lock.with(async () => {
    await delay(50);
    console.log("Task1 start");
    await delay(100);
    console.log("Task1 end");
  });
};

const task2 = async () => {
  await lock.with(async () => {
    await delay(10);
    console.log("Task2 start");
    await delay(10);
    console.log("Task2 end");
  });
};

const task3 = async () => {
  await lock.with(async () => {
    console.log("Task3 start");
    await delay(50);
    console.log("Task3 end");
  });
};

await Promise.all([task1(), task2(), task3()]);
// Task1 start
// Task1 end
// Task2 start
// Task2 end
// Task3 start
// Task3 end
