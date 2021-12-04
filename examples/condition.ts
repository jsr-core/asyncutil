import { Condition } from "../mod.ts";
import { delay } from "https://deno.land/std@0.117.0/async/mod.ts";

const cond = new Condition();
let counter = 0;

const countUp = () => {
  cond.with(() => {
    counter += 1;
    console.log("Count up");
    cond.notify();
    console.log("Notified");
  });
};

const task1 = async () => {
  await cond.with(async () => {
    await cond.wait();
    console.log("Task1 complete");
  });
};

const task2 = async () => {
  await cond.with(async () => {
    await cond.wait_for(() => counter >= 3);
    console.log("Task2 complete");
  });
};

const task3 = async () => {
  await delay(100);
  countUp();
  await delay(100);
  countUp();
  await delay(100);
  countUp();
  await delay(100);
  countUp();
  await delay(100);
  countUp();
};

await Promise.all([task1(), task2(), task3()]);
// Count up
// Notified
// Task1 complete
// Count up
// Notified
// Count up
// Notified
// Task2 complete
// Count up
// Notified
// Count up
// Notified
