import { combine, handle, rejectOnTimeout, resolveOnTimeout, supply, whenComplete } from "../src";

describe("combine", () => {
  it("both promises are resolved", (done) => {
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    combine(Promise.resolve("promise1"), Promise.resolve("promise2"), (value1, value2) => `${value1}, ${value2}`)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("promise1, promise2");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        }, 50);
      });
  });

  it("promise1 is rejected", (done) => {
    const fn = jest.fn();
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    combine(Promise.reject("promise1"), Promise.resolve("promise2"), fn)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(fn).not.toHaveBeenCalled();
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("promise1");
          done();
        }, 50);
      });
  });

  it("promise2 is rejected", (done) => {
    const fn = jest.fn();
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    combine(Promise.resolve("promise1"), Promise.reject("promise2"), fn)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(fn).not.toHaveBeenCalled();
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("promise2");
          done();
        }, 50);
      });
  });

  it("promise1 is rejected, then promise2", (done) => {
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
    const fn = jest.fn();
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    combine(promise1, promise2, fn)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(fn).not.toHaveBeenCalled();
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledWith("promise1");
          done();
        }, 50);
      });
  });

  it("promise2 is rejected, then promise1", (done) => {
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
    const fn = jest.fn();
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    combine(promise1, promise2, fn)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(fn).not.toHaveBeenCalled();
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledWith("promise2");
          done();
        }, 50);
      });
  });
});

describe("handle", () => {
  it("promise is resolved", (done) => {
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    handle(Promise.resolve("promise"), (value, reason) => (value || "no value") + ", " + (reason || "no reason"))
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("promise, no reason");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        }, 50);
      });
  });

  it("promise is rejected", (done) => {
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    handle(Promise.reject("promise"), (value, reason) => (value || "no value") + ", " + (reason || "no reason"))
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("no value, promise");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        }, 50);
      });
  });

  it("function throws for resolved promise", (done) => {
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    handle(Promise.resolve("promise"), (value, reason) => {
      throw "thrown: " + (value || "no value") + ", " + (reason || "no reason");
    })
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("thrown: promise, no reason");
          done();
        }, 50);
      });
  });

  it("function throws for rejected promise", (done) => {
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    handle(Promise.reject("promise"), (value, reason) => {
      throw "thrown: " + (value || "no value") + ", " + (reason || "no reason");
    })
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("thrown: no value, promise");
          done();
        }, 50);
      });
  });
});

describe("rejectOnTimeout", () => {
  it("promise is resolved before timeout", (done) => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve("promise");
      }, 50);
    });
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    rejectOnTimeout(promise, 60)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("promise");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        }, 50);
      });
  });

  it("promise is rejected before timeout", (done) => {
    const promise = new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject("promise");
      }, 50);
    });
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    rejectOnTimeout(promise, 60)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("promise");
          done();
        }, 50);
      });
  });

  it("promise is resolved after timeout", (done) => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve("promise");
      }, 50);
    });
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    rejectOnTimeout(promise, 40)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("Promise timed out");
          done();
        }, 50);
      });
  });

  it("promise is rejected after timeout", (done) => {
    const promise = new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject("promise");
      }, 50);
    });
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    rejectOnTimeout(promise, 40)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("Promise timed out");
          done();
        }, 50);
      });
  });
});

describe("resolveOnTimeout", () => {
  it("promise is resolved before timeout", (done) => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve("promise");
      }, 50);
    });
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    resolveOnTimeout(promise, "timed out", 60)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("promise");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        }, 50);
      });
  });

  it("promise is rejected before timeout", (done) => {
    const promise = new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject("promise");
      }, 50);
    });
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    resolveOnTimeout(promise, "timed out", 60)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("promise");
          done();
        }, 50);
      });
  });

  it("promise is resolved after timeout", (done) => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve("promise");
      }, 50);
    });
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    resolveOnTimeout(promise, "timed out", 40)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("timed out");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        }, 50);
      });
  });

  it("promise is rejected after timeout", (done) => {
    const promise = new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject("promise");
      }, 50);
    });
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    resolveOnTimeout(promise, "timed out", 40)
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("timed out");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        }, 50);
      });
  });
});

describe("supply", () => {
  it("function completes successfully", (done) => {
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    supply(() => "supplied")
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("supplied");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        }, 50);
      });
  });

  it("function throws error", (done) => {
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    supply(() => {
      throw "supplied error";
    })
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("supplied error");
          done();
        }, 50);
      });
  });
});

describe("whenComplete", () => {
  it("promise is resolved", (done) => {
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    whenComplete(Promise.resolve("promise"), (value, reason) => (value || "no value") + ", " + (reason || "no reason"))
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).toHaveBeenCalledTimes(1);
          expect(onfulfilled).toHaveBeenCalledWith("promise");
          expect(onrejected).not.toHaveBeenCalled();
          done();
        }, 50);
      });
  });

  it("promise is rejected", (done) => {
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    whenComplete(Promise.reject("promise"), (value, reason) => (value || "no value") + ", " + (reason || "no reason"))
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("promise");
          done();
        }, 50);
      });
  });

  it("function throws for resolved promise", (done) => {
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    whenComplete(Promise.resolve("promise"), (value, reason) => {
      throw "thrown: " + (value || "no value") + ", " + (reason || "no reason");
    })
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("thrown: promise, no reason");
          done();
        }, 50);
      });
  });

  it("function throws for rejected promise", (done) => {
    const onfulfilled = jest.fn();
    const onrejected = jest.fn();

    whenComplete(Promise.reject("promise"), (value, reason) => {
      throw "thrown: " + (value || "no value") + ", " + (reason || "no reason");
    })
      .then(onfulfilled)
      .catch(onrejected)
      .finally(() => {
        setTimeout(() => {
          expect(onfulfilled).not.toHaveBeenCalled();
          expect(onrejected).toHaveBeenCalledTimes(1);
          expect(onrejected).toHaveBeenCalledWith("thrown: no value, promise");
          done();
        }, 50);
      });
  });
});
