import { createHash, timingSafeEqual } from "node:crypto";

export const ALGOS = ["md5", "sha1", "sha256", "sha512"] as const;
export type Algo = (typeof ALGOS)[number];

export function isAlgo(a: string): a is Algo {
  return (ALGOS as readonly string[]).includes(a);
}

/** Hex digest of a string with the given algorithm. */
export function hashString(algo: Algo, text: string): string {
  return createHash(algo).update(text, "utf8").digest("hex");
}

/** Constant-time, case-insensitive comparison of two hex digests. */
export function verify(actual: string, expected: string): boolean {
  const a = actual.trim().toLowerCase();
  const b = expected.trim().toLowerCase();
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/** Guess an algorithm from a hex digest's length (ambiguous → null). */
export function algoFromLength(hex: string): Algo | null {
  switch (hex.trim().length) {
    case 32:
      return "md5";
    case 40:
      return "sha1";
    case 64:
      return "sha256";
    case 128:
      return "sha512";
    default:
      return null;
  }
}
