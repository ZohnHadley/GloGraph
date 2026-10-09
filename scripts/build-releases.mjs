// Build the GloGraph installer(s) in one run.
//
// GloGraph is completely free — there is no tier system, so there's a single
// build with full access to every feature. This runs `tauri build` once and drops
// clearly-named NSIS + MSI installers in `releases/`. Code signing (SSL.com eSigner)
// is wired through tauri.conf.json's signCommand wrapper and runs automatically when
// ESIGNER_ENV_FILE is set; otherwise the installers build unsigned.
//
// Run from the app dir: `npm run build:releases`.

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const BUNDLE = "src-tauri/target/release/bundle";
const OUT = "releases";

const version = JSON.parse(readFileSync("src-tauri/tauri.conf.json", "utf8")).version;
const buildDate = new Date().toISOString().slice(0, 10);

mkdirSync(OUT, { recursive: true });

console.log(`\n========== Building GloGraph v${version} ==========`);
execSync("npx tauri build", {
  stdio: "inherit",
  env: { ...process.env, GLOGRAPH_BUILD_DATE: buildDate },
});

// Newest matching file in a bundle dir — i.e. the one this build just produced.
// (The bundle dir also holds stale older-version installers.)
function newest(dir, ext) {
  if (!existsSync(dir)) return null;
  const hits = readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => ({ p: join(dir, f), t: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return hits.length ? hits[0].p : null;
}

const results = [];
const nsis = newest(join(BUNDLE, "nsis"), "-setup.exe");
const msi = newest(join(BUNDLE, "msi"), ".msi");
if (nsis) { const d = join(OUT, `GloGraph-${version}-x64-setup.exe`); copyFileSync(nsis, d); results.push(d); }
if (msi)  { const d = join(OUT, `GloGraph-${version}-x64.msi`);       copyFileSync(msi, d);  results.push(d); }
if (results.length === 0) throw new Error(`No installer found under ${BUNDLE} for v${version}.`);

console.log(`\n========== Done — installers in ${OUT}/ ==========`);
for (const r of results) console.log("  " + r);
console.log(
  "\nInstallers are code-signed (SSL.com eSigner) when ESIGNER_ENV_FILE is set;" +
  "\notherwise the wrapper skips signing and they build unsigned."
);
