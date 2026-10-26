import { expect, test } from "bun:test";

const run = (...args: string[]) => {
  const p = Bun.spawnSync(["bun", "run", "src/cli.ts", ...args]);
  return { code: p.exitCode, out: p.stdout.toString(), err: p.stderr.toString() };
};

test("--all combined with -c is a usage error, not a silent pass", () => {
  const r = run("abc", "--all", "-c", "0".repeat(64));
  expect(r.code).toBe(2);
  expect(r.err).toContain("--all cannot be combined with --check");
  expect(r.out).toBe("");
});

test("--all alone still lists every algorithm", () => {
  const r = run("abc", "--all");
  expect(r.code).toBe(0);
  expect(r.out).toContain("sha256");
});
