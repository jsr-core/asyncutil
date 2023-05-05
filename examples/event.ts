import { Event } from "../mod.ts";
import { delay } from "https://deno.land/std@0.186.0/async/mod.ts";

const event = new Event();

const task1 = async () => {
  await event.wait();
  console.log("Task1 complete");
};

const task2 = async () => {
  await event.wait();
  console.log("Task2 complete");
};

const task3 = async () => {
  await delay(100);
  console.log("Hello");
  event.set();
  await delay(100);
  console.log("World");
};

await Promise.all([task1(), task2(), task3()]);
// Hello
// Task1 complete
// Task2 complete
// World
