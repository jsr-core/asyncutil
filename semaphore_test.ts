import { test } from "@cross/test";
import { assertEquals, assertThrows } from "@std/assert";
import { Semaphore } from "./semaphore.ts";

test(
  "Semaphore regulates the number of workers concurrently running (n=5)",
  async () => {
    let nworkers = 0;
    const results: number[] = [];
    const sem = new Semaphore(5);
    const worker = () => {
      return sem.lock(async () => {
        nworkers++;
        results.push(nworkers);
        await new Promise((resolve) => setTimeout(resolve, 10));
        nworkers--;
      });
    };
    await Promise.all([...Array(10)].map(() => worker()));
    assertEquals(nworkers, 0);
    assertEquals(results, [
      1,
      2,
      3,
      4,
      5,
      5,
      5,
      5,
      5,
      5,
    ]);
  },
);

test(
  "Semaphore regulates the number of workers concurrently running (n=1)",
  async () => {
    let nworkers = 0;
    const results: number[] = [];
    const sem = new Semaphore(1);
    const worker = () => {
      return sem.lock(async () => {
        nworkers++;
        results.push(nworkers);
        await new Promise((resolve) => setTimeout(resolve, 10));
        nworkers--;
      });
    };
    await Promise.all([...Array(10)].map(() => worker()));
    assertEquals(nworkers, 0);
    assertEquals(results, [
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
    ]);
  },
);

test(
  "Semaphore regulates the number of workers concurrently running (n=10)",
  async () => {
    let nworkers = 0;
    const results: number[] = [];
    const sem = new Semaphore(10);
    const worker = () => {
      return sem.lock(async () => {
        nworkers++;
        results.push(nworkers);
        await new Promise((resolve) => setTimeout(resolve, 10));
        nworkers--;
      });
    };
    await Promise.all([...Array(10)].map(() => worker()));
    assertEquals(nworkers, 0);
    assertEquals(results, [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
    ]);
  },
);

test(
  "Semaphore throws RangeError if size is not a positive safe integer",
  () => {
    assertThrows(() => new Semaphore(NaN), RangeError);
    assertThrows(() => new Semaphore(Infinity), RangeError);
    assertThrows(() => new Semaphore(-Infinity), RangeError);
    assertThrows(() => new Semaphore(-1), RangeError);
    assertThrows(() => new Semaphore(1.1), RangeError);
    assertThrows(() => new Semaphore(0), RangeError);
  },
);

test(
  "Semaphore.waiterCount returns the number of waiters (n=5)",
  async () => {
    const befores: number[] = [];
    const afters: number[] = [];
    const sem = new Semaphore(5);
    const worker = (i: number) => {
      return sem.lock(async () => {
        befores.push(sem.waiterCount);
        await new Promise((resolve) => setTimeout(resolve, 10 + i));
        afters.push(sem.waiterCount);
      });
    };
    await Promise.all([...Array(10)].map((_, i) => worker(i)));
    /**
     * Worker 0 |5========5
     * Worker 1 |5=========4
     * Worker 2 |5==========3
     * Worker 3 |5===========2
     * Worker 4 |5============1
     * Worker 5 |----------4=============0
     * Worker 6 |-----------3==============0
     * Worker 7 |------------2===============0
     * Worker 8 |-------------1================0
     * Worker 9 |--------------0=================0
     */
    assertEquals(befores, [
      5,
      5,
      5,
      5,
      5,
      4,
      3,
      2,
      1,
      0,
    ]);
    assertEquals(afters, [
      5,
      4,
      3,
      2,
      1,
      0,
      0,
      0,
      0,
      0,
    ]);
  },
);
