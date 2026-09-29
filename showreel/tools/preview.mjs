// Render stills at given timestamps for review: node tools/preview.mjs 0.5,2.2,4 outDir [--guides]
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const times = process.argv[2].split(',').map(Number);
const out = process.argv[3] || 'preview';
const guides = process.argv.includes('--guides');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--force-color-profile=srgb', '--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto('file://' + path.join(here, '..', 'index.html') + (guides ? '?guides=1' : ''));
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
const files = [];
for (const t of times) {
  await page.evaluate(t => window.renderFrame(t), t);
  const f = path.join(out, `t_${t.toFixed(2).padStart(6, '0')}.png`);
  await page.screenshot({ path: f });
  files.push(f);
}
await browser.close();
console.log(files.join('\n'));
