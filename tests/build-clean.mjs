import { spawnSync } from "node:child_process";

const result = spawnSync("pnpm", ["build"], {
  cwd: new URL("..", import.meta.url),
  encoding: "utf8",
  timeout: 120_000,
});

const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
const viteChunkWarning = "Some chunks are larger than";

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  throw new Error(`Build failed with exit code ${result.status}.\n\n${output}`);
}

if (output.includes(viteChunkWarning)) {
  throw new Error(`Build completed with Vite chunk warnings.\n\n${output}`);
}

console.log("Build clean: production build completed without Vite warnings.");
