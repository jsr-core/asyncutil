import { assertEquals, assertThrows } from "./deps_test.ts";
import { promiseState } from "./state.ts";
import { BoundedSemaphore, Semaphore } from "./semaphore.ts";

Deno.test(
  "sem.acquire() acquire lock and sem.release() release lock",
  async () => {
    const sem = new Semaphore(3);
    assertEquals(sem.locked(), false);

    // A: 3 -> 2
    const a3to2 = sem.acquire();
    assertEquals(await promiseState(a3to2), "fulfilled");
    assertEquals(sem.locked(), false);

    // B: 2 -> 1
    const a2to1 = sem.acquire();
    assertEquals(await promiseState(a2to1), "fulfilled");
    assertEquals(sem.locked(), false);

    // C: 1 -> 0
    const a1to0 = sem.acquire();
    assertEquals(await promiseState(a1to0), "fulfilled");
    assertEquals(sem.locked(), true);

    // D: 0 -> 0 (1)
    const a0to01 = sem.acquire();
    assertEquals(await promiseState(a0to01), "pending");
    assertEquals(sem.locked(), true);

    // E: 0 -> 0 (2)
    const a0to02 = sem.acquire();
    assertEquals(await promiseState(a0to01), "pending");
    assertEquals(await promiseState(a0to02), "pending");
    assertEquals(sem.locked(), true);

    // E: 0 -> 0 (2)
    sem.release();
    assertEquals(await promiseState(a0to01), "fulfilled");
    assertEquals(await promiseState(a0to02), "pending");
    assertEquals(sem.locked(), true);

    // D: 0 -> 0 (1)
    sem.release();
    assertEquals(await promiseState(a0to01), "fulfilled");
    assertEquals(await promiseState(a0to02), "fulfilled");
    assertEquals(sem.locked(), true);

    // C: 0 -> 1
    sem.release();
    assertEquals(sem.locked(), false);

    // B: 1 -> 2
    sem.release();
    assertEquals(sem.locked(), false);

    // A: 2 -> 3
    sem.release();
    assertEquals(sem.locked(), false);
  },
);

Deno.test(
  "sem.release() is allowed to call more than initial value",
  async () => {
    const sem = new Semaphore(1);
    sem.release(); // 1 -> 2
    sem.release(); // 2 -> 3

    // A: 3 -> 2
    const a3to2 = sem.acquire();
    assertEquals(await promiseState(a3to2), "fulfilled");
    assertEquals(sem.locked(), false);

    // B: 2 -> 1
    const a2to1 = sem.acquire();
    assertEquals(await promiseState(a2to1), "fulfilled");
    assertEquals(sem.locked(), false);

    // C: 1 -> 0
    const a1to0 = sem.acquire();
    assertEquals(await promiseState(a1to0), "fulfilled");
    assertEquals(sem.locked(), true);

    // D: 0 -> 0 (1)
    const a0to01 = sem.acquire();
    assertEquals(await promiseState(a0to01), "pending");
    assertEquals(sem.locked(), true);

    // E: 0 -> 0 (2)
    const a0to02 = sem.acquire();
    assertEquals(await promiseState(a0to01), "pending");
    assertEquals(await promiseState(a0to02), "pending");
    assertEquals(sem.locked(), true);

    // E: 0 -> 0 (2)
    sem.release();
    assertEquals(await promiseState(a0to01), "fulfilled");
    assertEquals(await promiseState(a0to02), "pending");
    assertEquals(sem.locked(), true);

    // D: 0 -> 0 (1)
    sem.release();
    assertEquals(await promiseState(a0to01), "fulfilled");
    assertEquals(await promiseState(a0to02), "fulfilled");
    assertEquals(sem.locked(), true);

    // C: 0 -> 1
    sem.release();
    assertEquals(sem.locked(), false);

    // B: 1 -> 2
    sem.release();
    assertEquals(sem.locked(), false);

    // A: 2 -> 3
    sem.release();
    assertEquals(sem.locked(), false);
  },
);

Deno.test(
  "sem.release() is NOT allowed to call more than initial value in BoundedSemaphore",
  () => {
    const sem = new BoundedSemaphore(1);

    assertThrows(
      () => sem.release(),
      Error,
      "release() cannot be called more than acquire()",
    );
  },
);
