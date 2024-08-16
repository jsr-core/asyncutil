// Using `deadline` in `@std/async@1.0.2` cause the following error:
// 'Promise resolution is still pending but the event loop has already resolved'
// So we need to implement `deadline` by ourselves.
export async function deadline<T>(
  promise: Promise<T>,
  timeout: number,
): Promise<T> {
  const waiter = Promise.withResolvers<never>();
  const timer = setTimeout(
    () => waiter.reject(new DOMException("Signal timed out.")),
    timeout,
  );
  return await Promise.race([
    waiter.promise,
    promise.finally(() => clearTimeout(timer)),
  ]);
}
