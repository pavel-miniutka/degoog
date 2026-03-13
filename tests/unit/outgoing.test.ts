import { describe, test, expect, beforeEach } from "bun:test";
import {
  setOutgoingAllowlist,
  isUrlAllowedForOutgoing,
} from "../../src/server/utils/outgoing";

describe("outgoing", () => {
  beforeEach(() => {
    const prev = process.env.DEGOOG_OUTGOING_ALLOWED_HOSTS;
    setOutgoingAllowlist([]);
    if (prev !== undefined) process.env.DEGOOG_OUTGOING_ALLOWED_HOSTS = prev;
  });

  describe("setOutgoingAllowlist", () => {
    test("empty or null list clears to empty set", () => {
      setOutgoingAllowlist(["example.com"]);
      setOutgoingAllowlist([]);
      expect(isUrlAllowedForOutgoing("https://example.com")).toBe(false);
    });
  });

  describe("isUrlAllowedForOutgoing", () => {
    test("returns false for non-http(s) protocols", () => {
      setOutgoingAllowlist(["*"]);
      expect(isUrlAllowedForOutgoing("ftp://host.com")).toBe(false);
      expect(isUrlAllowedForOutgoing("file:///local")).toBe(false);
    });

    test("returns false for invalid URL", () => {
      setOutgoingAllowlist(["*"]);
      expect(isUrlAllowedForOutgoing("not-a-url")).toBe(false);
    });

    test("when allowlist is null (unset), allows any http(s) URL", () => {
      setOutgoingAllowlist([]);
      expect(isUrlAllowedForOutgoing("https://any.com")).toBe(false);
      setOutgoingAllowlist(["other.com"]);
      expect(isUrlAllowedForOutgoing("https://allowed.com")).toBe(false);
    });

    test("when allowlist has hosts, allows only those hosts", () => {
      setOutgoingAllowlist(["example.com", "api.example.org"]);
      expect(isUrlAllowedForOutgoing("https://example.com/path")).toBe(true);
      expect(isUrlAllowedForOutgoing("http://api.example.org")).toBe(true);
      expect(isUrlAllowedForOutgoing("https://other.com")).toBe(false);
    });

    test("host matching is case-insensitive", () => {
      setOutgoingAllowlist(["Example.COM"]);
      expect(isUrlAllowedForOutgoing("https://example.com")).toBe(true);
      expect(isUrlAllowedForOutgoing("https://EXAMPLE.COM")).toBe(true);
    });

    test("when allowlist has *, allows any http(s) URL", () => {
      setOutgoingAllowlist(["*"]);
      expect(isUrlAllowedForOutgoing("https://any.com")).toBe(true);
      expect(isUrlAllowedForOutgoing("http://other.org")).toBe(true);
    });

    test("empty allowlist denies all", () => {
      setOutgoingAllowlist([]);
      expect(isUrlAllowedForOutgoing("https://example.com")).toBe(false);
    });
  });
});
