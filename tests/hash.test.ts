import { test, expect } from "bun:test";
import { hashString, verify, isAlgo, algoFromLength } from "../src/hash";

test("known digests for 'abc'", () => {
  expect(hashString("md5", "abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
  expect(hashString("sha1", "abc")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
  expect(hashString("sha256", "abc")).toBe(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("verify is case-insensitive and length-guarded", () => {
  const d = hashString("sha256", "hello");
  expect(verify(d, d.toUpperCase())).toBe(true);
  expect(verify(d, "  " + d + "  ")).toBe(true);
  expect(verify(d, "deadbeef")).toBe(false); // wrong length
  expect(verify("", "")).toBe(false);
});

test("isAlgo guards input", () => {
  expect(isAlgo("sha256")).toBe(true);
  expect(isAlgo("sha3")).toBe(false);
});

test("algoFromLength detects by digest length", () => {
  expect(algoFromLength("0".repeat(32))).toBe("md5");
  expect(algoFromLength("0".repeat(40))).toBe("sha1");
  expect(algoFromLength("0".repeat(64))).toBe("sha256");
  expect(algoFromLength("0".repeat(128))).toBe("sha512");
  expect(algoFromLength("0".repeat(10))).toBeNull();
});
