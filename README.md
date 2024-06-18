# completion-stage
[![npm](https://img.shields.io/npm/v/completion-stage)](https://www.npmjs.com/package/completion-stage)
[![Build Status](https://github.com/robtimus/completion-stage/actions/workflows/build.yml/badge.svg)](https://github.com/robtimus/completion-stage/actions/workflows/build.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=robtimus%3Acompletion-stage&metric=alert_status)](https://sonarcloud.io/summary/overall?id=robtimus%3Acompletion-stage)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=robtimus%3Acompletion-stage&metric=coverage)](https://sonarcloud.io/summary/overall?id=robtimus%3Acompletion-stage)
[![Known Vulnerabilities](https://snyk.io/test/github/robtimus/completion-stage/badge.svg)](https://snyk.io/test/github/robtimus/completion-stage)

A port of Java's [CompletionStage](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CompletionStage.html) using [promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). [CompletableFuture](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CompletableFuture.html) is also partially ported.

The following is an overview of how each `CompletionStage` method is implemented, where `future` in the left column is replaced by `promise` in the right.

| CompletionStage                        | Promise                                       |
| ---------------------------------------| --------------------------------------------- |
| `future.acceptEither(other, action)`   | `Promise.race([promise, other]).then(action)` |
| `future.applyToEither(other, fn)`      | `Promise.race([promise, other]).then(fn)`     |
| `future.exceptionally(fn)`             | `promise.catch(fn)`                           |
| `future.exceptionallyCompose(fn)`      | `promise.catch(fn)`                           |
| `future.handle(fn)`                    | `handle(promise, fn)`                         |
| `future.runAfterBoth(other, action)`   | `Promise.all([promise, other]).then(action)`  |
| `future.runAfterEither(other, action)` | `Promise.race([promise, other]).then(action)` |
| `future.thenAccept(action)`            | `promise.then(action)`                        |
| `future.thenAcceptBoth(other, action)` | `Promise.all([promise, other]).then(action)`  |
| `future.thenApply(fn)`                 | `promise.then(fn)`                            |
| `future.thenCombine(other, fn)`        | `Promise.all([promise, other]).then(fn)`      |
| `future.thenCompose(fn)`               | `promise.then(fn)`                            |
| `future.thenRun(action)`               | `promise.then(fn)`                            |
| `future.toCompletableFuture()`         | N/A                                           |
| `future.whenComplete(action)`          | `whenComplete(promise, action)`               |

In addition, the following is an overview of `CompletableFuture` methods that are implemented using promises.

| CompletableFuture                                                 | Promise                                                     |
| ----------------------------------------------------------------- | ----------------------------------------------------------- |
| `CompletableFuture.allOf(future1, future2)`                       | `Promise.all([promise1, promise2])`<sup>1</sup>             |
| `CompletableFuture.anyOf(future1, future2)`                       | `Promise.race([promise1, promise2])`<sup>2</sup>            |
| `CompletableFuture.completedFuture(value)`                        | `Promise.resolve(value)`                                    |
| `CompletableFuture.completedStage(value)`                         | `Promise.resolve(value)`                                    |
| `future.completeOnTimeout(value, timeout, TimeUnit.MILLISECONDS)` | `resolveOnTimeout(promise, value, timeout)`<sup>3</sup>     |
| `CompletableFuture.failedFuture(ex)`                              | `Promise.reject(ex)`                                        |
| `CompletableFuture.failedStage(ex)`                               | `Promise.reject(ex)`                                        |
| `future.orTimeout(timeout, TimeUnit.MILLISECONDS)`                | `rejectOnTimeout(promise, timeout)`<sup>3</sup><sup>4</sup> |
| `CompletableFuture.runAsync(action)`                              | `supply(action)`<sup>5</sup>                                |
| `CompletableFuture.supplyAsync(supplier)`                         | `supply(supplier)`<sup>5</sup>                              |

<sup><sup>1</sup>: whereas `CompletableFuture.allOf` returns a `CompletableFuture<Void>`, the generic type of the promise returned by `Promise.all` is a combination of the generic types of each passed promise.</sup>\
<sup><sup>2</sup>: whereas `CompletableFuture.anyOf` returns a `CompletableFuture<Object>`, the generic type of the promise returned by `Promise.race` is the union of the generic types of each passed promise.</sup>\
<sup><sup>3</sup>: the timeouts for `resolveOnTimeout` and `rejectOnTimeout` can only be given as milliseconds.</sup>\
<sup><sup>4</sup>: an optional rejection reason can be given as a function. The result of this function is used as rejection reason upon timeout.</sup>\
<sup><sup>5</sup>: an optional delay in milliseconds can be given.</sup>

Note that [promise.then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then), [promise.catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) and `supply` can be used in the same way where `CompletionStage` and `CompletableFuture` need multiple methods. Which `CompletionStage` or `CompletableFuture` method is implemented depends on the return value of the function passed to `promise.then`, `promise.catch` or `supply`.
