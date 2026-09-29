// Frame-accurate renderer: headless Chromium draws each subframe, ffmpeg blends them into motion blurred frames.
// Usage: node tools/render.mjs [--fps 30] [--sub 4] [--shutter 0.5] [--workers 4] [--from 0] [--to 60] [--scale 1] [--out out/silent.mkv]
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const FPS = +opt('fps', 30);
const SUB = +opt('sub', 4);
const SHUTTER = +opt('shutter', 0.5);
const WORKERS = +opt('workers', 4);
const FROM = +opt('from', 0);
const TO = +opt('to', 60);
const SCALE = +opt('scale', 1);
const OUT = path.resolve(opt('out', path.join(root, 'out', 'silent.mkv')));
const TMP = path.resolve(opt('tmp', path.join(root, 'out', 'chunks')));
const WORKER = opt('worker', null);

const W = Math.round(1080 * SCALE / 2) * 2, H = Math.round(1920 * SCALE / 2) * 2;

async function runWorker(id, f0, f1) {
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--force-color-profile=srgb', '--allow-file-access-from-files', '--disable-gpu-vsync'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error(`[w${id}] pageerror`, e.message));
  await page.goto('file://' + path.join(root, 'index.html'));
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const cdp = await page.context().newCDPSession(page);
  const out = path.join(TMP, `chunk_${String(id).padStart(2, '0')}.mkv`);
  const vf = SUB > 1
    ? `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/(${FPS}*TB)`
    : `setpts=N/(${FPS}*TB)`;
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-c:v', 'png', '-i', '-',
    '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '6', '-pix_fmt', 'yuv444p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let k = f0; k < f1; k++) {
    for (let j = 0; j < SUB; j++) {
      const off = SUB > 1 ? ((j + 0.5) / SUB - 0.5) * SHUTTER : 0;
      const t = Math.min(59.9999, Math.max(0, (k + off) / FPS));
      await page.evaluate(([tt, kk]) => window.renderFrame(tt, kk), [t, k]);
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, ...(SCALE !== 1 ? { clip: { x: 0, y: 0, width: 1080, height: 1920, scale: SCALE } } : {}) });
      if (!ff.stdin.write(Buffer.from(shot.data, 'base64'))) await once(ff.stdin, 'drain');
    }
    if ((k - f0) % 30 === 29) {
      const done = k - f0 + 1, el = (Date.now() - t0) / 1000;
      console.log(`[w${id}] ${done}/${f1 - f0} frames  ${(el / done).toFixed(2)}s/frame  eta ${((f1 - f0 - done) * el / done / 60).toFixed(1)}min`);
    }
  }
  ff.stdin.end();
  await once(ff, 'close');
  await browser.close();
  return out;
}

if (WORKER !== null) {
  const f0 = +opt('f0'), f1 = +opt('f1');
  await runWorker(+WORKER, f0, f1);
  process.exit(0);
}

fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const F0 = Math.round(FROM * FPS), F1 = Math.round(TO * FPS);
const per = Math.ceil((F1 - F0) / WORKERS);
const jobs = [];
const t0 = Date.now();
for (let i = 0; i < WORKERS; i++) {
  const a = F0 + i * per, z = Math.min(F1, a + per);
  if (a >= z) break;
  const child = spawn(process.execPath, [fileURLToPath(import.meta.url), '--worker', String(i), '--f0', String(a), '--f1', String(z), '--fps', String(FPS), '--sub', String(SUB), '--shutter', String(SHUTTER), '--scale', String(SCALE), '--tmp', TMP], { stdio: 'inherit' });
  jobs.push(once(child, 'exit').then(([code]) => { if (code !== 0) throw new Error(`worker ${i} exited ${code}`); return path.join(TMP, `chunk_${String(i).padStart(2, '0')}.mkv`); }));
}
const chunks = await Promise.all(jobs);
const list = path.join(TMP, 'list.txt');
fs.writeFileSync(list, chunks.map(c => `file '${c}'`).join('\n') + '\n');
const cat = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', OUT], { stdio: 'inherit' });
await once(cat, 'close');
console.log(`done ${OUT} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
