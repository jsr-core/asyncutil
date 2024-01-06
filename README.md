# async

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/async)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/async/mod.ts)
[![Test](https://github.com/lambdalisue/deno-async/workflows/Test/badge.svg)](https://github.com/lambdalisue/deno-async/actions?query=workflow%3ATest)

Asynchronous primitive modules for [Deno][deno].

[python's asyncio]: https://docs.python.org/3/library/asyncio.html
[deno]: https://deno.land/

## Usage

### Barrier

`Barrier` is a synchronization primitive that allows multiple tasks to wait
until all of them have reached a certain point of execution before continuing.

```ts
import { Barrier } from "https://deno.land/x/async@$MODULE_VERSION/barrier.ts";

const barrier = new Barrier(3);

async function worker(id: number) {
  console.log(`worker ${id} is waiting`);
  await barrier.wait();
  console.log(`worker ${id} is done`);
}

worker(1);
worker(2);
worker(3);
```

### Lock/RwLock

`Lock` is a mutual exclusion lock that provides safe concurrent access to a
shared value.

```ts
import { AsyncValue } from "https://deno.land/x/async@$MODULE_VERSION/testutil.ts";
import { Lock } from "https://deno.land/x/async@$MODULE_VERSION/lock.ts";

// Critical section
const count = new Lock(new AsyncValue(0));
await count.lock(async (count) => {
  const v = await count.get();
  count.set(v + 1);
});
```

`RwLock` is a reader-writer lock implementation that allows multiple concurrent
reads but only one write at a time. Readers can acquire the lock simultaneously
as long as there are no writers holding the lock. Writers block all other
readers and writers until the write operation completes.

```ts
import { AsyncValue } from "https://deno.land/x/async@$MODULE_VERSION/testutil.ts";
import { RwLock } from "https://deno.land/x/async@$MODULE_VERSION/rw_lock.ts";

const count = new RwLock(new AsyncValue(0));

// rlock should allow multiple readers at a time
await Promise.all([...Array(10)].map(() => {
  return count.rlock(async (count) => {
    console.log(await count.get());
  });
}));

// lock should allow only one writer at a time
await Promise.all([...Array(10)].map(() => {
  return count.lock(async (count) => {
    const v = await count.get();
    console.log(v);
    count.set(v + 1);
  });
}));
```

### Mutex

`Mutex` is a mutex (mutual exclusion) is a synchronization primitive that grants
exclusive access to a shared resource.

This is a low-level primitive. Use `Lock` instead of `Mutex` if you need to
access a shared value concurrently.

```ts
import { AsyncValue } from "https://deno.land/x/async@$MODULE_VERSION/testutil.ts";
import { Mutex } from "https://deno.land/x/async@$MODULE_VERSION/mutex.ts";

const count = new AsyncValue(0);

async function doSomething() {
  const v = await count.get();
  await count.set(v + 1);
}

// Critical section
const mu = new Mutex();
await mu.acquire();
try {
  await doSomething();
} finally {
  mu.release();
}
```

### Notify

`Notify` is an async notifier that allows one or more "waiters" to wait for a
notification.

```ts
import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";
import { promiseState } from "https://deno.land/x/async@$MODULE_VERSION/state.ts";
import { Notify } from "https://deno.land/x/async@$MODULE_VERSION/notify.ts";

const notify = new Notify();
const waiter1 = notify.notified();
const waiter2 = notify.notified();
notify.notify();
assertEquals(await promiseState(waiter1), "fulfilled");
assertEquals(await promiseState(waiter2), "pending");
notify.notify();
assertEquals(await promiseState(waiter1), "fulfilled");
assertEquals(await promiseState(waiter2), "fulfilled");
```

### Queue/Stack

`Queue` is a queue implementation that allows for adding and removing elements,
with optional waiting when popping elements from an empty queue.

```ts
import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";
import { Queue } from "https://deno.land/x/async@$MODULE_VERSION/queue.ts";

const queue = new Queue<number>();
queue.push(1);
queue.push(2);
queue.push(3);
assertEquals(await queue.pop(), 1);
assertEquals(await queue.pop(), 2);
assertEquals(await queue.pop(), 3);
```

`Stack` is a stack implementation that allows for adding and removing elements,
with optional waiting when popping elements from an empty stack.

```ts
import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";
import { Stack } from "https://deno.land/x/async@$MODULE_VERSION/stack.ts";

const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);
assertEquals(await stack.pop(), 3);
assertEquals(await stack.pop(), 2);
assertEquals(await stack.pop(), 1);
```

### Semaphore

A semaphore that allows a limited number of concurrent executions of an
operation.

```ts
import { Semaphore } from "https://deno.land/x/async@$MODULE_VERSION/semaphore.ts";

const sem = new Semaphore(5);
const worker = () => {
  return sem.lock(async () => {
    // do something
  });
};
await Promise.all([...Array(10)].map(() => worker()));
```

### promiseState

`promiseState` is used to determine the state of the promise. Mainly for testing
purpose.

```typescript
import { promiseState } from "https://deno.land/x/async@$MODULE_VERSION/mod.ts";

const p1 = Promise.resolve("Resolved promise");
console.log(await promiseState(p1)); // fulfilled

const p2 = Promise.reject("Rejected promise").catch(() => undefined);
console.log(await promiseState(p2)); // rejected

const p3 = new Promise(() => undefined);
console.log(await promiseState(p3)); // pending
```

### AsyncValue

`AsyncValue` is a class that wraps a value and allows it to be set
asynchronously.

```ts
import { assertEquals } from "https://deno.land/std@0.186.0/testing/asserts.ts";
import { AsyncValue } from "https://deno.land/x/async@$MODULE_VERSION/testutil.ts";

const v = new AsyncValue(0);
assertEquals(await v.get(), 0);
await v.set(1);
assertEquals(await v.get(), 1);
```

## License

The code follows MIT license written in [LICENSE](./LICENSE). Contributors need
to agree that any modifications sent in this repository follow the license.
