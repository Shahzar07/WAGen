// Dump the SFX cue sheet registered by the scenes: node tools/cues.mjs > audio/cues.json
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + path.join(root, 'index.html'));
await page.waitForFunction(() => window.__ready === true);
const data = await page.evaluate(() => ({ bpm: window.BPM, beat: window.BEAT, cues: window.CUES.slice().sort((a, b) => a.t - b.t) }));
await browser.close();
process.stdout.write(JSON.stringify(data, null, 1));
