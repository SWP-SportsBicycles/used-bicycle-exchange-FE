#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const agentsPath = path.join(repoRoot, "AGENTS.md");
const claudePath = path.join(repoRoot, "CLAUDE.md");

function readNormalized(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
}

if (!fs.existsSync(agentsPath) || !fs.existsSync(claudePath)) {
  console.error("AGENTS.md or CLAUDE.md is missing.");
  process.exit(1);
}

const agents = readNormalized(agentsPath);
const claude = readNormalized(claudePath);

if (agents !== claude) {
  const agentsLines = agents.split("\n");
  const claudeLines = claude.split("\n");
  const maxLines = Math.max(agentsLines.length, claudeLines.length);

  let firstDiffLine = 1;
  for (let i = 0; i < maxLines; i += 1) {
    if ((agentsLines[i] ?? "") !== (claudeLines[i] ?? "")) {
      firstDiffLine = i + 1;
      break;
    }
  }

  console.error(
    `AGENTS.md and CLAUDE.md are out of sync (first diff at line ${firstDiffLine}).`
  );
  console.error("Keep these files identical for consistent AI agent behavior.");
  process.exit(1);
}

console.log("AGENTS.md and CLAUDE.md are synchronized.");
