import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "src/App.jsx"), "utf8");
const css = readFileSync(resolve(root, "src/styles.css"), "utf8");

const forbiddenPatterns = [
  ["scroll-linked CSS animation timeline", /animation-timeline\s*:/],
  ["SVG stroke dash animation", /stroke-dash(?:array|offset)/],
  ["paint-time drop shadows", /drop-shadow\(/],
  ["backdrop blur on moving layers", /backdrop-filter\s*:/],
  ["content-visibility reveal hitch", /content-visibility:\s*auto/],
  ["JavaScript scroll listener", /addEventListener\((["'])scroll\1/],
  ["manual requestAnimationFrame render loop", /requestAnimationFrame\(render\)/],
  ["layout reads in scroll animation code", /getBoundingClientRect\(\)/],
];

const failures = forbiddenPatterns
  .filter(([, pattern]) => pattern.test(app) || pattern.test(css))
  .map(([name]) => `Found ${name}.`);

if (!css.includes("contain: layout paint style")) {
  failures.push("Moving visual layers should use layout/paint containment.");
}

if (failures.length > 0) {
  throw new Error(`Scroll performance budget failed:\n${failures.join("\n")}`);
}

console.log("Scroll performance budget passed.");
