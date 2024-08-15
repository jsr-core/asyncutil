import { assertEquals, assertThrows } from "@std/assert";
import { Semaphore } from "./semaphore.ts";

Deno.test("Semaphore", async (t) => {
  await t.step("with using statement", async (t) => {
    await t.step(
      "regulates the number of workers concurrently running (n=5)",
      async () => {
        let nworkers = 0;
        const results: number[] = [];
        const sem = new Semaphore(5);
        const worker = async () => {
          using _lock = await sem.acquire();
          nworkers++;
          results.push(nworkers);
          await new Promise((resolve) => setTimeout(resolve, 10));
          nworkers--;
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

    await t.step(
      "regulates the number of workers concurrently running (n=1)",
      async () => {
        let nworkers = 0;
        const results: number[] = [];
        const sem = new Semaphore(1);
        const worker = async () => {
          using _lock = await sem.acquire();
          nworkers++;
          results.push(nworkers);
          await new Promise((resolve) => setTimeout(resolve, 10));
          nworkers--;
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

    await t.step(
      "regulates the number of workers concurrently running (n=10)",
      async () => {
        let nworkers = 0;
        const results: number[] = [];
        const sem = new Semaphore(10);
        const worker = async () => {
          using _lock = await sem.acquire();
          nworkers++;
          results.push(nworkers);
          await new Promise((resolve) => setTimeout(resolve, 10));
          nworkers--;
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
  });

  await t.step("with lock method", async (t) => {
    await t.step(
      "regulates the number of workers concurrently running (n=5)",
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

    await t.step(
      "regulates the number of workers concurrently running (n=1)",
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

    await t.step(
      "regulates the number of workers concurrently running (n=10)",
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
  });

  await t.step(
    "throws RangeError if size is not a positive safe integer",
    () => {
      assertThrows(() => new Semaphore(NaN), RangeError);
      assertThrows(() => new Semaphore(Infinity), RangeError);
      assertThrows(() => new Semaphore(-Infinity), RangeError);
      assertThrows(() => new Semaphore(-1), RangeError);
      assertThrows(() => new Semaphore(1.1), RangeError);
      assertThrows(() => new Semaphore(0), RangeError);
    },
  );
});
