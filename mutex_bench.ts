import { Mutex } from "./mutex.ts";
import { Mutex as Mutex102 } from "jsr:@core/asyncutil@1.0.2/mutex";
import { Mutex as MutexIssue30 } from "https://gist.githubusercontent.com/PandaWorker/ec07a22b55668073e70237285da18cee/raw/612f7cf8f8df80a114780ddf07ca9acdebe97b9f/MyMutex.ts";

const mutex = new Mutex();
Deno.bench("Mutex", async function () {
  using _lock = await mutex.acquire();
});

const mutex102 = new Mutex102();
Deno.bench("Mutex (1.0.2)", async function () {
  using _lock = await mutex102.acquire();
});

const mutexIssue30 = new MutexIssue30();
Deno.bench("Mutex (Issue #30)", async function () {
  using _lock = await mutexIssue30.acquire();
});
