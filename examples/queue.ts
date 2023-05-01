import { delay } from "https://deno.land/std@0.185.0/async/mod.ts";
import { Event, Queue } from "../mod.ts";

const queue: Queue<string> = new Queue();
const closed = new Event();

const consumer = async () => {
  while (!closed.is_set()) {
    const recv = await Promise.race([queue.get(), closed.wait()]);
    if (recv === true) {
      break;
    }
    console.log(`Recv: ${recv}`);
  }
};

const producer = async () => {
  await delay(100);
  await queue.put("Hello");
  await delay(100);
  await queue.put("World");
  await delay(100);
  closed.set();
};

await Promise.all([consumer(), producer()]);
