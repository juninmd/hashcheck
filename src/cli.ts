#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { ALGOS, isAlgo, hashString, verify, algoFromLength, type Algo } from "./hash";

const C = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

const HELP = `hashcheck — hash & verify

Usage:
  hashcheck <text> [-a <algo>] [--all]
  hashcheck -f <file> [-a <algo>] [-c <expected>]

Options:
  -a, --algo <algo>   ${ALGOS.join(" | ")}   (default: sha256)
  -f, --file <path>   hash a file (streamed)
  -c, --check <hex>   verify against an expected digest (algo auto-detected)
  --all               print md5/sha1/sha256/sha512 (cannot be combined with -c)
  -h, --help`;

function opt(argv: string[], ...names: string[]): string | undefined {
  for (const n of names) {
    const i = argv.indexOf(n);
    if (i > -1) return argv[i + 1];
  }
  return undefined;
}

function hashFile(path: string, algo: Algo): Promise<string> {
  return new Promise((resolve, reject) => {
    const h = createHash(algo);
    createReadStream(path)
      .on("data", (d) => h.update(d))
      .on("end", () => resolve(h.digest("hex")))
      .on("error", reject);
  });
}

async function main(argv: string[]): Promise<number> {
  if (argv.includes("-h") || argv.includes("--help") || argv.length === 0) {
    console.log(HELP);
    return argv.length === 0 ? 2 : 0;
  }

  const algoArg = opt(argv, "-a", "--algo");
  if (algoArg && !isAlgo(algoArg)) {
    console.error(C.red(`error: unknown algo "${algoArg}" (${ALGOS.join(", ")})`));
    return 2;
  }
  const algo: Algo = (algoArg as Algo) ?? "sha256";
  const file = opt(argv, "-f", "--file");
  const check = opt(argv, "-c", "--check");
  const all = argv.includes("--all");
  if (all && check !== undefined) {
    console.error(C.red("error: --all cannot be combined with --check"));
    return 2;
  }

  // Positional text = first non-flag arg that isn't an option's value.
  const consumed = new Set([algoArg, file, check].filter((v): v is string => v !== undefined));
  const text = argv.find((a, i) => !a.startsWith("-") && !consumed.has(a) && !consumed.has(argv[i - 1]!));

  let digest: string;
  try {
    if (file) digest = await hashFile(file, all ? "sha256" : algo);
    else if (text !== undefined) digest = hashString(all ? "sha256" : algo, text);
    else {
      console.error(C.red("error: give <text> or -f <file>"));
      return 2;
    }
  } catch (err) {
    console.error(C.red(`error: ${err instanceof Error ? err.message : err}`));
    return 1;
  }

  if (all) {
    for (const a of ALGOS) {
      const d = file ? await hashFile(file, a) : hashString(a, text!);
      console.log(`${a.padEnd(7)} ${d}`);
    }
    return 0;
  }

  if (check !== undefined) {
    const detected = algoFromLength(check);
    const cmpAlgo = detected ?? algo;
    const actual = file ? await hashFile(file, cmpAlgo) : hashString(cmpAlgo, text!);
    const ok = verify(actual, check);
    console.log(`${cmpAlgo}: ${ok ? C.green("MATCH ✓") : C.red("MISMATCH ✗")}`);
    if (!ok) console.log(C.dim(`  expected ${check.trim().toLowerCase()}\n  actual   ${actual}`));
    return ok ? 0 : 1;
  }

  console.log(digest);
  return 0;
}

main(process.argv.slice(2)).then((c) => process.exit(c));
