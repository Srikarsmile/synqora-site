import { spawnSync } from "node:child_process";

const result = spawnSync(
  "npx",
  ["--yes", "react-doctor@latest", "--verbose", "--scope", "changed"],
  {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
    timeout: 120_000,
  },
);

const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
const hasIssues = /All \d+ issues/.test(output) || /⚠/.test(output) || !/100 \/ 100/.test(output);

if (result.error) {
  throw result.error;
}

if (result.status !== 0 || hasIssues) {
  throw new Error(`React Doctor is not clean.\n\n${output}`);
}

console.log("React Doctor clean: 100/100 with no warnings.");
