// Deploy the website to Cloudflare Pages, excluding internal docs.
//
// `wrangler pages deploy` publishes every file in the target directory and has no
// reliable ignore mechanism, so we copy the website to a temp dir minus the markdown
// docs (README.md, LAUNCH_CHECKLIST.md, assets/README.md) and deploy that. The docs
// stay in the repo for navigation; they just aren't served at glograph.com.
//
// The site lives at the workspace root (`../website`, a sibling of this app dir); this
// script is run via `npm run deploy`, whose cwd is the app dir, hence the `../` prefix.
import { cpSync, rmSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { execSync } from "node:child_process";

const SRC = "../website";
const OUT = ".site-dist";

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

cpSync(SRC, OUT, {
  recursive: true,
  filter: (src) => {
    const s = src.toLowerCase();
    const base = basename(src);
    if (s.endsWith(".md")) return false;            // internal docs
    if (s.endsWith(".assetsignore")) return false;
    // Cloudflare Pages control files must ship despite the "_" prefix rule below.
    if (base === "_headers" || base === "_redirects") return true;
    if (base.startsWith("_")) return false;          // temp/scratch files (e.g. screenshots)
    return true;
  },
});

// Cache-bust local CSS/JS. `styles.css` and `main.js` have no content hash, so browsers
// keep serving stale copies after a deploy (a returning visitor wouldn't see CSS changes
// without a hard refresh). Append a per-deploy version query to those references in the
// top-level HTML files. This rewrites only the temp copy; the source HTML stays clean.
const v = Date.now().toString(36);
for (const file of readdirSync(OUT)) {
  if (!file.endsWith(".html")) continue;
  const p = join(OUT, file);
  const html = readFileSync(p, "utf8").replace(
    /(href|src)="(styles\.css|main\.js)"/g,
    `$1="$2?v=${v}"`,
  );
  writeFileSync(p, html);
}

try {
  execSync(
    `npx --yes wrangler pages deploy ${OUT} --project-name=glograph --branch=main --commit-dirty=true`,
    { stdio: "inherit" },
  );
} finally {
  rmSync(OUT, { recursive: true, force: true });
}
