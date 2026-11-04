// Checks that the running Node.js is exactly the version in package.json engines.node.
// Reads the package.json next to this script's folder, never the current folder's.
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const expected = pkg.engines?.node;
const actual = process.versions.node;

if (typeof expected !== "string" || !/^\d+\.\d+\.\d+$/.test(expected)) {
  console.error("package.json engines.node must be an exact version such as 24.13.0.");
  process.exit(1);
}

if (actual !== expected) {
  console.error(
    `DevPulse needs Node.js ${expected} (package.json engines.node), but this is ${actual}. Switch with: nvm use ${expected}`,
  );
  process.exit(1);
}

console.log(`Node.js ${actual} matches package.json engines.node.`);
