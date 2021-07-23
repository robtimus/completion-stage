# completion-stage

TODO

| CompletableFuture | Promise |
| --- | --- |
| acceptEither(Async) | Promise.race + promise.then |
| allOf | Promise.all |
| anyOf | Promise.race |
| applyToEither(Async) | Promise.race + promise.then |
| completedFuture | Promise.resolve |
| completedStage | Promise.resolve |
| completeOnTimeout | resolveOnTimeout |
| exceptionally | promise.catch |
| failedFuture | Promise.reject |
| failedStage | Promise.reject |
| handle(Async) | handle |
| orTimeout | rejectOnTimeout |
| runAfterBoth(Async) | Promise.all + promise.then |
| runAfterEither(Async) | Promise.race + promise.then |
| runAsync | supply |
| supplyAsync | supply |
| thenAccept(Async) | promise.then |
| thenAcceptBoth(Async) | Promise.all + promise.then |
| thenApply(Async) | promise.then |
| thenCombine(Async) | combine |
| thenCompose(Async) | promise.then |
| thenRun(Async) | promise.then |
| whenComplete(Async) | whenComplete |
