# async-deno

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/async)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/async/mod.ts)
[![Test](https://github.com/lambdalisue/async-deno/workflows/Test/badge.svg)](https://github.com/lambdalisue/async-deno/actions?query=workflow%3ATest)

Asynchronous primitive modules loosely port from
[Python's asyncio][python's asyncio] for [Deno][deno].

[python's asyncio]: https://docs.python.org/3/library/asyncio.html
[deno]: https://deno.land/

## Usage

### Lock

A lock can be used to guarantee exclusive access to a shared resource.

```typescript
import { Lock } from "https://deno.land/x/async/mod.ts";
import { delay } from "https://deno.land/std@0.86.0/async/mod.ts";

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
```

### Event

An event can be used to notify multiple tasks that some event has happend.

```typescript
import { Event } from "https://deno.land/x/async/mod.ts";
import { delay } from "https://deno.land/std@0.86.0/async/mod.ts";

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
```

### Condition

A condition primitive can be used by a task to wait for some event to happen and
then get exclusive access to a shared resource.

```typescript
import { Condition } from "https://deno.land/x/async/mod.ts";
import { delay } from "https://deno.land/std@0.86.0/async/mod.ts";

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
```

### Semaphore

A semaphore managers an internal counter which is decremented by each
`acquire()` call and incremented by each `release()` call. The counter can never
go below zero; when `acquire()` finds that it is zero, it blocks, waiting until
some task calls `release()`.

```typescript
import { Semaphore } from "https://deno.land/x/async/mod.ts";
import { delay } from "https://deno.land/std@0.86.0/async/mod.ts";

const sem = new Semaphore(3);
let n_workers = 0;

const worker = async () => {
  await sem.with(async () => {
    n_workers += 1;
    console.log(`${n_workers} workers are working...`);
    await delay(100);
    console.log(`Complete`);
    n_workers -= 1;
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
```

### Queue

Queue can be used like pipe between two distinct tasks.

```typescript
import { Event, Queue } from "https://deno.land/x/async/mod.ts";
import { delay } from "https://deno.land/std@0.86.0/async/mod.ts";

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
// Recv: Hello
// Recv: World
```

### promiseState

`promiseState` is used to determine the state of the promise. Mainly for testing
purpose.

```typescript
import { promiseState } from "https://deno.land/x/async/mod.ts";

const p = Promise.resolve("Resolved promise");
console.log(await promiseState(p)); // fulfilled

const p = Promise.reject("Rejected promise").catch(() => undefined);
console.log(await promiseState(p)); // rejected

const p = new Promise(() => undefined);
console.log(await promiseState(p)); // pending
```

## License

The code follows MIT license written in [LICENSE](./LICENSE). Contributors need
to agree that any modifications sent in this repository follow the license.
