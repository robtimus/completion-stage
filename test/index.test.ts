import { describe, it, expect, vi } from "vitest";
import { combine, handle, rejectOnTimeout, resolveOnTimeout, supply, whenComplete } from "../src";

describe("combine", () => {
  it("both promises are resolved", () =>
    new Promise<void>((done) => {
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      combine(Promise.resolve("promise1"), Promise.resolve("promise2"), (value1, value2) => `${value1}, ${value2}`)
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("promise1, promise2");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        });
    }));

  it("promise1 is rejected", () =>
    new Promise<void>((done) => {
      const fn = vi.fn();
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      combine(Promise.reject("promise1"), Promise.resolve("promise2"), fn)
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(fn).not.toHaveBeenCalled();
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("promise1");
          done();
        });
    }));

  it("promise2 is rejected", () =>
    new Promise<void>((done) => {
      const fn = vi.fn();
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      combine(Promise.resolve("promise1"), Promise.reject("promise2"), fn)
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(fn).not.toHaveBeenCalled();
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("promise2");
          done();
        });
    }));

  it("promise1 is rejected, then promise2", () =>
    new Promise<void>((done) => {
      const promise1 = new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject("promise1");
        }, 10);
      });
      const promise2 = new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject("promise2");
        }, 20);
      });
      const fn = vi.fn();
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      combine(promise1, promise2, fn)
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(fn).not.toHaveBeenCalled();
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledWith("promise1");
          done();
        });
    }));

  it("promise2 is rejected, then promise1", () =>
    new Promise<void>((done) => {
      const promise1 = new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject("promise1");
        }, 20);
      });
      const promise2 = new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject("promise2");
        }, 10);
      });
      const fn = vi.fn();
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      combine(promise1, promise2, fn)
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(fn).not.toHaveBeenCalled();
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledWith("promise2");
          done();
        });
    }));

  it("function throws", () =>
    new Promise<void>((done) => {
      const promise1 = new Promise((resolve) => {
        setTimeout(() => {
          resolve("promise1");
        }, 20);
      });
      const promise2 = new Promise((resolve) => {
        setTimeout(() => {
          resolve("promise2");
        }, 10);
      });
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      combine(promise1, promise2, (value1, value2) => {
        throw "thrown: " + value1 + ", " + value2;
      })
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("thrown: promise1, promise2");
          done();
        });
    }));
});

describe("handle", () => {
  it("promise is resolved", () =>
    new Promise<void>((done) => {
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      handle(Promise.resolve("promise"), (value, reason) => (value || "no value") + ", " + (reason || "no reason"))
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("promise, no reason");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        });
    }));

  it("promise is rejected", () =>
    new Promise<void>((done) => {
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      handle(Promise.reject("promise"), (value, reason) => (value || "no value") + ", " + (reason || "no reason"))
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("no value, promise");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        });
    }));

  it("function throws for resolved promise", () =>
    new Promise<void>((done) => {
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      handle(Promise.resolve("promise"), (value, reason) => {
        throw "thrown: " + (value || "no value") + ", " + (reason || "no reason");
      })
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("thrown: promise, no reason");
          done();
        });
    }));

  it("function throws for rejected promise", () =>
    new Promise<void>((done) => {
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      handle(Promise.reject("promise"), (value, reason) => {
        throw "thrown: " + (value || "no value") + ", " + (reason || "no reason");
      })
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("thrown: no value, promise");
          done();
        });
    }));
});

describe("rejectOnTimeout", () => {
  it("promise is resolved before timeout", () =>
    new Promise<void>((done) => {
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          resolve("promise");
        }, 50);
      });
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      rejectOnTimeout(promise, 60).then(onfulfilled).catch(onrejected);

      setTimeout(() => {
        expect(onfulfilled).toHaveBeenCalledTimes(1);
        expect(onfulfilled).toHaveBeenCalledWith("promise");
        expect(onrejected).not.toHaveBeenCalled();
        done();
      }, 50);
    }));

  it("promise is rejected before timeout", () =>
    new Promise<void>((done) => {
      const promise = new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject("promise");
        }, 50);
      });
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      rejectOnTimeout(promise, 60).then(onfulfilled).catch(onrejected);

      setTimeout(() => {
        expect(onfulfilled).not.toHaveBeenCalled();
        expect(onrejected).toHaveBeenCalledTimes(1);
        expect(onrejected).toHaveBeenCalledWith("promise");
        done();
      }, 50);
    }));

  it("promise is resolved after timeout", () =>
    new Promise<void>((done) => {
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          resolve("promise");
        }, 50);
      });
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      rejectOnTimeout(promise, 40).then(onfulfilled).catch(onrejected);

      setTimeout(() => {
        expect(onfulfilled).not.toHaveBeenCalled();
        expect(onrejected).toHaveBeenCalledTimes(1);
        expect(onrejected).toHaveBeenCalledWith("Promise timed out");
        done();
      }, 40);
    }));

  it("promise is rejected after timeout", () =>
    new Promise<void>((done) => {
      const promise = new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject("promise");
        }, 50);
      });
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      rejectOnTimeout(promise, 40).then(onfulfilled).catch(onrejected);

      setTimeout(() => {
        expect(onfulfilled).not.toHaveBeenCalled();
        expect(onrejected).toHaveBeenCalledTimes(1);
        expect(onrejected).toHaveBeenCalledWith("Promise timed out");
        done();
      }, 40);
    }));
});

describe("resolveOnTimeout", () => {
  it("promise is resolved before timeout", () =>
    new Promise<void>((done) => {
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          resolve("promise");
        }, 50);
      });
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      resolveOnTimeout(promise, "timed out", 60).then(onfulfilled).catch(onrejected);

      setTimeout(() => {
        expect(onfulfilled).toHaveBeenCalledTimes(1);
        expect(onfulfilled).toHaveBeenCalledWith("promise");
        expect(onrejected).not.toHaveBeenCalled();
        done();
      }, 50);
    }));

  it("promise is rejected before timeout", () =>
    new Promise<void>((done) => {
      const promise = new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject("promise");
        }, 50);
      });
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      resolveOnTimeout(promise, "timed out", 60).then(onfulfilled).catch(onrejected);

      setTimeout(() => {
        expect(onfulfilled).not.toHaveBeenCalled();
        expect(onrejected).toHaveBeenCalledTimes(1);
        expect(onrejected).toHaveBeenCalledWith("promise");
        done();
      }, 50);
    }));

  it("promise is resolved after timeout", () =>
    new Promise<void>((done) => {
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          resolve("promise");
        }, 50);
      });
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      resolveOnTimeout(promise, "timed out", 40).then(onfulfilled).catch(onrejected);

      setTimeout(() => {
        expect(onfulfilled).toHaveBeenCalledTimes(1);
        expect(onfulfilled).toHaveBeenCalledWith("timed out");
        expect(onrejected).not.toHaveBeenCalled();
        done();
      }, 40);
    }));

  it("promise is rejected after timeout", () =>
    new Promise<void>((done) => {
      const promise = new Promise((_resolve, reject) => {
        setTimeout(() => {
          reject("promise");
        }, 50);
      });
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      resolveOnTimeout(promise, "timed out", 40).then(onfulfilled).catch(onrejected);

      setTimeout(() => {
        expect(onfulfilled).toHaveBeenCalledTimes(1);
        expect(onfulfilled).toHaveBeenCalledWith("timed out");
        expect(onrejected).not.toHaveBeenCalled();
        done();
      }, 40);
    }));
});

describe("supply", () => {
  it("function completes successfully", () =>
    new Promise<void>((done) => {
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      supply(() => "supplied")
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("supplied");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        });
    }));

  it("function throws error", () =>
    new Promise<void>((done) => {
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      supply(() => {
        throw "supplied error";
      })
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("supplied error");
          done();
        });
    }));
});

describe("whenComplete", () => {
  it("promise is resolved", () =>
    new Promise<void>((done) => {
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      whenComplete(Promise.resolve("promise"), (value, reason) => (value || "no value") + ", " + (reason || "no reason"))
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("promise");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        });
    }));

  it("promise is rejected", () =>
    new Promise<void>((done) => {
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      whenComplete(Promise.reject("promise"), (value, reason) => (value || "no value") + ", " + (reason || "no reason"))
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("promise");
          done();
        });
    }));

  it("function throws for resolved promise", () =>
    new Promise<void>((done) => {
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      whenComplete(Promise.resolve("promise"), (value, reason) => {
        throw "thrown: " + (value || "no value") + ", " + (reason || "no reason");
      })
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("thrown: promise, no reason");
          done();
        });
    }));

  it("function throws for rejected promise", () =>
    new Promise<void>((done) => {
      const onfulfilled = vi.fn();
      const onrejected = vi.fn();

      whenComplete(Promise.reject("promise"), (value, reason) => {
        throw "thrown: " + (value || "no value") + ", " + (reason || "no reason");
      })
        .then(onfulfilled)
        .catch(onrejected)
        .finally(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("thrown: no value, promise");
          done();
        });
    }));
});
