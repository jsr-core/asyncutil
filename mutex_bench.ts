import { Mutex } from "./mutex.ts";

const mutex = new Mutex();

Deno.bench("Mutex", async function () {
  using _lock = await mutex.acquire();
});
