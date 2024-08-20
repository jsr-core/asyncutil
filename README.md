# asyncutil

[![JSR](https://jsr.io/badges/@core/asyncutil)](https://jsr.io/@core/asyncutil)
[![Test](https://github.com/jsr-core/asyncutil/actions/workflows/test.yml/badge.svg)](https://github.com/jsr-core/asyncutil/actions/workflows/test.yml)
[![Codecov](https://codecov.io/github/jsr-core/asyncutil/graph/badge.svg?token=pfbLRGU5AM)](https://codecov.io/github/jsr-core/asyncutil)

Asynchronous primitive utility pack.

## Usage

### AsyncValue

`AsyncValue` is a class that wraps a value and allows it to be set
asynchronously.

```ts
import { assertEquals } from "@std/assert";
import { AsyncValue } from "@core/asyncutil/async-value";

const v = new AsyncValue(0);
assertEquals(await v.get(), 0);
await v.set(1);
assertEquals(await v.get(), 1);
```

### Barrier

`Barrier` is a synchronization primitive that allows multiple tasks to wait
until all of them have reached a certain point of execution before continuing.

```ts
import { Barrier } from "@core/asyncutil/barrier";

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

### ensurePromise

`ensurePromise` is a utility function that ensures a value is a promise.

```ts
import { ensurePromise } from "@core/asyncutil/ensure-promise";

const p1 = ensurePromise(Promise.resolve("Resolved promise"));
console.log(await p1); // Resolved promise

const p2 = ensurePromise("Not a promise");
console.log(await p2); // Not a promise
```

### flushPromises

`flushPromises` flushes all pending promises in the microtask queue.

```ts
import { flushPromises } from "@core/asyncutil/flush-promises";

let count = 0;
Array.from({ length: 5 }).forEach(() => {
  Promise.resolve()
    .then(() => count++)
    .then(() => count++);
});

console.log(count); // 0
await flushPromises();
console.log(count); // 10
```

### Lock/RwLock

`Lock` is a mutual exclusion lock that provides safe concurrent access to a
shared value.

```ts
import { AsyncValue } from "@core/asyncutil/async-value";
import { Lock } from "@core/asyncutil/lock";

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
import { AsyncValue } from "@core/asyncutil/async-value";
import { RwLock } from "@core/asyncutil/rw-lock";

const count = new RwLock(new AsyncValue(0));

// rlock should allow multiple readers at a time
await Promise.all(
  [...Array(10)].map(() => {
    return count.rlock(async (count) => {
      console.log(await count.get());
    });
  }),
);

// lock should allow only one writer at a time
await Promise.all(
  [...Array(10)].map(() => {
    return count.lock(async (count) => {
      const v = await count.get();
      console.log(v);
      count.set(v + 1);
    });
  }),
);
```

### Mutex

`Mutex` is a mutex (mutual exclusion) is a synchronization primitive that grants
exclusive access to a shared resource.

This is a low-level primitive. Use `Lock` instead of `Mutex` if you need to
access a shared value concurrently.

```ts
import { AsyncValue } from "@core/asyncutil/async-value";
import { Mutex } from "@core/asyncutil/mutex";

const count = new AsyncValue(0);

async function doSomething() {
  const v = await count.get();
  await count.set(v + 1);
}

const mu = new Mutex();

// Critical section
{
  using _lock = await mu.acquire();
  await doSomething();
}
```

### Notify

`Notify` is an async notifier that allows one or more "waiters" to wait for a
notification.

```ts
import { assertEquals } from "@std/assert";
import { promiseState } from "@core/asyncutil/promise-state";
import { Notify } from "@core/asyncutil/notify";

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

### promiseState

`promiseState` is used to determine the state of the promise. Mainly for testing
purpose.

```typescript
import { promiseState } from "@core/asyncutil/promise-state";

const p1 = Promise.resolve("Resolved promise");
console.log(await promiseState(p1)); // fulfilled

const p2 = Promise.reject("Rejected promise").catch(() => undefined);
console.log(await promiseState(p2)); // rejected

const p3 = new Promise(() => undefined);
console.log(await promiseState(p3)); // pending
```

### Queue/Stack

`Queue` is a queue implementation that allows for adding and removing elements,
with optional waiting when popping elements from an empty queue.

```ts
import { assertEquals } from "@std/assert";
import { Queue } from "@core/asyncutil/queue";

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
import { assertEquals } from "@std/assert";
import { Stack } from "@core/asyncutil/stack";

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
import { Semaphore } from "@core/asyncutil/semaphore";

const sem = new Semaphore(5);
const worker = () => {
  return sem.lock(async () => {
    // do something
  });
};
await Promise.all([...Array(10)].map(() => worker()));
```

### WaitGroup

`WaitGroup` is a synchronization primitive that enables promises to coordinate
and synchronize their execution. It is particularly useful in scenarios where a
specific number of tasks must complete before the program can proceed.

```ts
import { delay } from "@std/async/delay";
import { WaitGroup } from "@core/asyncutil/wait-group";

const wg = new WaitGroup();

async function worker(id: number) {
  wg.add(1);
  console.log(`worker ${id} is waiting`);
  await delay(100);
  console.log(`worker ${id} is done`);
  wg.done();
}

worker(1);
worker(2);
worker(3);
await wg.wait();
```

## License

The code follows MIT license written in [LICENSE](./LICENSE). Contributors need
to agree that any modifications sent in this repository follow the license.
