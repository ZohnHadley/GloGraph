// Rasterize ../website/og-image.svg → ../website/assets/og-image-v3.png (1200×630).
// resvg-js is a self-contained renderer; loadSystemFonts picks up Segoe UI etc.
// `website/` is a workspace-level sibling of this app dir; `root` below is the app dir.
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(resolve(root, '../website/og-image.svg'), 'utf8');
const out = resolve(root, '../website/assets/og-image-v3.png');

const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true },
  background: '#171717',
}).render().asPng();

writeFileSync(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);
