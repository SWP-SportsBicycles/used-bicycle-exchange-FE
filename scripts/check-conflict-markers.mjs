#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const skipDirs = new Set([
  ".git",
  "node_modules",
  ".next",
  ".gitnexus",
  ".vercel",
  ".vscode",
]);

const includeExtensions = new Set([
  ".md",
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  ".yml",
  ".yaml",
]);

const includeFileNames = new Set([
  "AGENTS.md",
  "CLAUDE.md",
]);

const markersRegex = /^(<<<<<<<|=======|>>>>>>>)(?:\s|$)/;
const findings = [];

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(repoRoot, fullPath).replaceAll("\\", "/");

    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) {
        continue;
      }
      walk(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!includeExtensions.has(ext) && !includeFileNames.has(entry.name)) {
      continue;
    }

    const content = fs.readFileSync(fullPath, "utf8");
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 1) {
      if (markersRegex.test(lines[i])) {
        findings.push({
          file: relPath,
          line: i + 1,
          marker: lines[i].trim(),
        });
      }
    }
  }
}

walk(repoRoot);

if (findings.length > 0) {
  console.error("Conflict markers detected:");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} -> ${finding.marker}`);
  }
  process.exit(1);
}

console.log("No conflict markers found.");
