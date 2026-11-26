/* Structural check for the supstack-para skill package. */
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];

const jsonFiles = [
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
  ".opencode/opencode.jsonc",
];
for (const rel of jsonFiles) {
  const raw = await fs.readFile(path.join(root, rel), "utf8");
  try {
    JSON.parse(raw.replace(/^\s*\/\/.*$/gm, ""));
  } catch (e) {
    errors.push(`${rel}: invalid JSON (${e.message})`);
  }
}

const skills = await fs.readdir(path.join(root, "skills"), { withFileTypes: true });
const skillDirs = skills.filter((e) => e.isDirectory()).map((e) => e.name);
if (skillDirs.length !== 7) errors.push(`expected 7 skills, found ${skillDirs.length}`);
for (const dir of skillDirs) {
  const rel = path.join("skills", dir, "SKILL.md");
  const raw = await fs.readFile(path.join(root, rel), "utf8");
  const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(raw);
  if (!fm) { errors.push(`${rel}: missing frontmatter`); continue; }
  if (!/^name:\s*\S+/m.test(fm[1])) errors.push(`${rel}: missing name`);
  if (!/^description:/m.test(fm[1])) errors.push(`${rel}: missing description`);
  if (!raw.slice(fm[0].length).trim()) errors.push(`${rel}: empty body`);
  const links = [...raw.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)].map((m) => m[1]);
  for (const link of links) {
    if (/^(https?:|mailto:)/.test(link)) continue;
    const target = path.resolve(root, "skills", dir, link);
    try { await fs.access(target); }
    catch { errors.push(`${rel}: broken link ${link}`); }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`OK: ${skillDirs.length} skills, metadata and links valid.`);
}
