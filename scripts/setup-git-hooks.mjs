#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const repoRoot = process.cwd();
const gitDir = path.join(repoRoot, ".git");

if (process.env.CI) {
  console.log("Skipping git hook setup in CI.");
  process.exit(0);
}

if (!fs.existsSync(gitDir)) {
  console.log("No .git directory found, skipping git hook setup.");
  process.exit(0);
}

try {
  execSync("git config core.hooksPath .githooks", {
    cwd: repoRoot,
    stdio: "ignore",
  });
  console.log("Configured git hooks path to .githooks");
} catch {
  console.warn("Could not configure git hooks path automatically.");
  console.warn("Run this manually: git config core.hooksPath .githooks");
}
