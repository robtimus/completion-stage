/**
 * Combines two promises into one.
 * If both promises resolve successfully, the returned promise resolves successfully with the combined result of the two promises.
 * If either promise fails, the returned promise will be rejected with the same rejection reason.
 * If combining the results throws an error, the returned promise will be rejected with the error as its reason.
 * @deprecated Use `Promise.all` and apply the given function to both results.
 */
export async function combine<T, U, V>(promise1: Promise<T>, promise2: Promise<U>, fn: (value1: T, value2: U) => V): Promise<V> {
  const result = await Promise.all([promise1, promise2]);
  return fn(result[0], result[1]);
}

/**
 * Calls a function if a promise is either resolved or rejected.
 * This function is like calling `fn(value, undefined)` if the promise is resolved,
 * or `fn(undefined, reason)` if the promise is rejected.
 * If the function throws an error, the returned promise is rejected with the error as its reason.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handle<T, U>(promise: Promise<T>, fn: (value?: T, reason?: any) => U): Promise<U> {
  return new Promise((resolve, reject) => {
    promise
      .then((value) => {
        try {
          resolve(fn(value, undefined));
        } catch (e) {
          reject(e);
        }
      })
      .catch((reason) => {
        try {
          resolve(fn(undefined, reason));
        } catch (e) {
          reject(e);
        }
      });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function actOnTimeout<T>(promise: Promise<T>, timeout: number, onTimeout: (doResolve: (result: T) => void, doReject: (reason: any) => void) => any): Promise<T> {
  return new Promise((resolve, reject) => {
    let resolvedOrRejected = false;
    let timeoutId: NodeJS.Timeout | undefined;

    function doClearTimeout() {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    }

    function doResolve(result: T) {
      if (!resolvedOrRejected) {
        resolve(result);
        resolvedOrRejected = true;
      }

      doClearTimeout();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function doReject(reason: any) {
      if (!resolvedOrRejected) {
        reject(reason);
        resolvedOrRejected = true;
      }

      doClearTimeout();
    }

    promise.then((value) => doResolve(value)).catch((reason) => doReject(reason));
    timeoutId = setTimeout(() => onTimeout(doResolve, doReject), timeout);
  });
}

/**
 * Rejects a promise if it times out.
 * If the promise is resolved before the timeout expires, the returned promise is resolved with the same value.
 * If the promise is rejected before the timeout expires, the returned promise is rejected with the same reason.
 * If the promise is neither resolved or rejected before the timeout expires, the returned promise is rejected with the given reason.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rejectOnTimeout<T>(promise: Promise<T>, timeout: number, reasonOnTimeout: () => any = () => "Promise timed out"): Promise<T> {
  return actOnTimeout(promise, timeout, (_, doReject) => doReject(reasonOnTimeout()));
}

/**
 * Resolves a promise if it times out.
 * If the promise is resolved before the timeout expires, the returned promise is resolved with the same value.
 * If the promise is rejected before the timeout expires, the returned promise is rejected with the same reason.
 * If the promise is neither resolved or rejected before the timeout expires, the returned promise is resolved with the given value.
 */
export function resolveOnTimeout<T>(promise: Promise<T>, valueOnTimeout: T, timeout: number): Promise<T> {
  return actOnTimeout(promise, timeout, (doResolve) => doResolve(valueOnTimeout));
}

/**
 * Returns a promise that will resolve to the result of calling a function.
 * If the function throws an error, the promise will be rejected with the error as its reason.
 *
 * This is like `Promise.resolve(supplier())`, except the function is called asynchronously.
 */
export function supply<T>(supplier: () => T, delay = 0): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(supplier());
      } catch (e) {
        reject(e);
      }
    }, delay);
  });
}

/**
 * Calls a function if a promise is either resolved or rejected.
 * This function is like {@link handle}, except it doesn't change the promise result type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function whenComplete<T>(promise: Promise<T>, fn: (value?: T, reason?: any) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    promise
      .then((value) => {
        try {
          fn(value, undefined);
          resolve(value);
        } catch (e) {
          reject(e);
        }
      })
      .catch((reason) => {
        try {
          fn(undefined, reason);
          reject(reason);
        } catch (e) {
          reject(e);
        }
      });
  });
}
