import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { debug } from "../../src/server/utils/logger";

describe("logger", () => {
  const orig = process.env.LOGGER;

  beforeEach(() => {
    delete process.env.LOGGER;
  });

  afterEach(() => {
    if (orig !== undefined) process.env.LOGGER = orig;
  });

  test("debug does not throw when LOGGER is not set", () => {
    expect(() => debug("ctx", "msg")).not.toThrow();
  });

  test("debug does not throw when LOGGER=debug", () => {
    process.env.LOGGER = "debug";
    expect(() => debug("ctx", "msg")).not.toThrow();
  });

  test("debug accepts optional error", () => {
    expect(() => debug("ctx", "msg", new Error("e"))).not.toThrow();
  });
});
