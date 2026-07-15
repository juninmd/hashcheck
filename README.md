# #️⃣ hashcheck

Hash strings or files (`md5` / `sha1` / `sha256` / `sha512`) and **verify** against an expected digest — from the terminal, zero deps.

```bash
hashcheck "hello"                          # sha256 hex
hashcheck "hello" -a md5
hashcheck -f ./installer.iso               # stream-hash a file
hashcheck -f ./installer.iso -c 9f86d0...  # verify (algo auto-detected by length)
hashcheck "hello" --all                    # md5 + sha1 + sha256 + sha512
```

- **Verify** auto-detects the algorithm from the expected digest's length and compares in constant time (case-insensitive). Exit `0` = match, `1` = mismatch — drop it in CI.
- Files are streamed, so hashing a multi-GB ISO won't blow up memory.

## Dev
```bash
bun install && bun test
bun run build   # tsdown -> dist/cli.js
```
Hashing/verify/detection logic is in `src/hash.ts`, unit-tested against known vectors.

MIT.
