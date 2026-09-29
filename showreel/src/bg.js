/* Background: night sky gradient, drifting light, stars, grain, vignette. */
(function (g) {
  'use strict';
  const { clamp, lerp, kf, E, rng, css } = L;

  const W = 1080, H = 1920;
  let ctx, grainEl, vignetteEl, stars = [];

  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const mix = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];

  const LAV = hex('#b292f9'), VIO = hex('#6d4bd8'), GRN = hex('#25d366'), AMB = hex('#f2a65a'), MINT = hex('#9de8b0');

  // Stylised UAE skyline: silhouettes plus individually lit windows.
  let sky = null;
  function buildSkyline() {
    const r = rng(2024);
    const shapes = [], windows = [];
    const addWin = (x0, x1, yTop, yBot, sx = 15, sy = 19, w = 5, hgt = 8) => {
      for (let y = yTop + 14; y < yBot - 8; y += sy) {
        for (let x = x0 + 9; x < x1 - 9; x += sx) {
          const rr = r();
          windows.push({ x, y, w, h: hgt, th: 0.72 * clamp((1920 - y) / 700) + 0.28 * rr, warm: r() < 0.62, a: 0.55 + r() * 0.45, ph: r() * 6.28 });
        }
      }
    };
    const rect = (x, top, w, ant) => {
      shapes.push({ pts: [[x, 1925], [x, top], [x + w, top], [x + w, 1925]] });
      if (ant) shapes.push({ pts: [[x + w / 2 - 1.5, top], [x + w / 2 - 1.5, top - ant], [x + w / 2 + 1.5, top - ant], [x + w / 2 + 1.5, top]] });
      addWin(x, x + w, top, 1925);
    };
    // generic towers, back row then front row
    let x = -30;
    while (x < 1100) {
      const w = 54 + r() * 70;
      const skip = (x > 690 && x < 830) || (x > 80 && x < 250);
      if (!skip) rect(x, 1560 + r() * 200, w, r() < 0.25 ? 20 + r() * 40 : 0);
      x += w + 6 + r() * 14;
    }
    // Emirates Towers style pair with slanted crowns
    const slant = (x0, w, top, rise) => { shapes.push({ pts: [[x0, 1925], [x0, top], [x0 + w, top - rise], [x0 + w, 1925]] }); addWin(x0, x0 + w, top, 1925, 14, 18); };
    slant(520, 58, 1470, 60);
    slant(596, 52, 1500, 54);
    // Burj Khalifa: stepped tiers and spire
    const cx = 760;
    const tiers = [[82, 1925, 1560], [66, 1560, 1470], [53, 1470, 1400], [42, 1400, 1344], [32, 1344, 1300], [23, 1300, 1264], [15, 1264, 1236], [9, 1236, 1214]];
    tiers.forEach(([hw, yb, yt], i) => {
      const off = (i % 2 ? 6 : -6);
      shapes.push({ pts: [[cx - hw + off, yb], [cx - hw + off, yt], [cx + hw - off * 0.5, yt], [cx + hw - off * 0.5, yb]] });
      addWin(cx - hw + off, cx + hw - off * 0.5, yt, yb, 13, 17, 4, 7);
    });
    shapes.push({ pts: [[cx - 4, 1216], [cx - 1.5, 1112], [cx + 1.5, 1112], [cx + 4, 1216]] });
    // Burj Al Arab sail
    shapes.push({ sail: true });
    // Museum of the Future ring
    shapes.push({ ring: [410, 1838, 76, 60, 38, 26] });
    sky = { shapes, windows };
  }

  function drawSkyline(t, op, lights, dawn, skyY = 0) {
    if (op <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = op;
    ctx.translate(0, skyY);
    const fill = ctx.createLinearGradient(0, 1110, 0, 1920);
    fill.addColorStop(0, '#1d1433');
    fill.addColorStop(0.5, '#120b20');
    fill.addColorStop(1, '#07050c');
    ctx.fillStyle = fill;
    ctx.strokeStyle = `rgba(201,175,255,${0.18 + 0.2 * dawn})`;
    ctx.lineWidth = 1.5;
    for (const s of sky.shapes) {
      ctx.beginPath();
      if (s.sail) {
        ctx.moveTo(118, 1925); ctx.lineTo(118, 1548); ctx.lineTo(128, 1530);
        ctx.bezierCurveTo(200, 1600, 238, 1760, 244, 1925); ctx.closePath();
      } else if (s.ring) {
        const [rx0, ry0, a, bb, ia, ib] = s.ring;
        ctx.ellipse(rx0, ry0, a, bb, -0.08, 0, Math.PI * 2);
        ctx.ellipse(rx0 + 6, ry0 - 2, ia, ib, -0.08, 0, Math.PI * 2, true);
        ctx.rect(rx0 - 40, ry0 + 40, 80, 60);
      } else {
        s.pts.forEach(([px_, py], i) => (i ? ctx.lineTo(px_, py) : ctx.moveTo(px_, py)));
        ctx.closePath();
      }
      ctx.fill('evenodd');
      ctx.stroke();
    }
    // windows
    for (const w of sky.windows) {
      const on = clamp((lights - w.th) * 14);
      if (on <= 0.01) continue;
      const fl = 0.85 + 0.15 * Math.sin(t * 1.3 + w.ph);
      const a = on * w.a * fl;
      ctx.fillStyle = w.warm ? `rgba(255,214,170,${a})` : `rgba(201,175,255,${a})`;
      ctx.fillRect(w.x, w.y, w.w, w.h);
    }
    // haze to keep the Reels caption zone calm
    const hz = ctx.createLinearGradient(0, 1500, 0, 1920);
    hz.addColorStop(0, 'rgba(18,12,25,0)');
    hz.addColorStop(1, 'rgba(10,7,16,0.55)');
    ctx.fillStyle = hz;
    ctx.fillRect(0, 1500, W, 420);
    ctx.restore();
  }

  function build(stage) {
    const c = L.h('canvas', { width: W, height: H, class: 'layer', id: 'bg' });
    stage.appendChild(c);
    ctx = c.getContext('2d');
    buildSkyline();

    const r = rng(7);
    for (let i = 0; i < 190; i++) {
      stars.push({
        x: r() * W, y: r() * H * 1.1, r: 0.6 + Math.pow(r(), 3) * 2.2,
        f: 0.4 + r() * 1.6, ph: r() * Math.PI * 2, a: 0.25 + r() * 0.75, glow: r() < 0.07,
        z: 0.3 + r() * 0.7,
      });
    }

    // Grain tile
    const tile = L.h('canvas', { width: 256, height: 256 });
    const tctx = tile.getContext('2d');
    const img = tctx.createImageData(256, 256);
    const gr = rng(99);
    for (let i = 0; i < 256 * 256; i++) {
      const v = Math.max(0, Math.min(255, 128 + (gr() + gr() + gr() - 1.5) * 150));
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    tctx.putImageData(img, 0, 0);
    grainEl = L.h('div', { class: 'layer', id: 'grain', style: { backgroundImage: `url(${tile.toDataURL()})`, backgroundSize: '256px 256px', mixBlendMode: 'overlay', opacity: '0.10', pointerEvents: 'none' } });
    vignetteEl = L.h('div', { class: 'layer', id: 'vignette', style: { background: 'radial-gradient(ellipse 95% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(4,2,8,0.62) 100%)', pointerEvents: 'none' } });
    return { grainEl, vignetteEl };
  }

  // Scene driven parameters, keyed to the beat grid.
  function params(t) {
    const B = g.BEAT;
    const drop = 24 * B;
    return {
      top: mix(hex('#06040b'), hex('#0e0918'), clamp((t - drop) / 3)),
      bottom: mix(hex('#150c22'), hex('#1b1030'), clamp((t - drop) / 3)),
      stars: kf(t, [[0, 1], [9 * B, 1], [11 * B, 0.55], [24 * B, 0.35], [104 * B, 0.35], [108 * B, 0.8], [60, 0.8]]),
      moon: kf(t, [[0, 1], [4 * B, 0.85], [8 * B, 0.5], [10 * B, 0]]),
      lavBloom: kf(t, [[0, 0.10], [4 * B, 0.28], [8 * B, 0.18], [22 * B, 0.08], [24 * B, 0.95, E.outExpo], [26 * B, 0.42], [32 * B, 0.3], [88 * B, 0.3], [92 * B, 0.5], [96 * B, 0.3], [108 * B, 0.55], [60, 0.6]]),
      green: kf(t, [[0, 0], [24 * B, 0], [26 * B, 0.16], [104 * B, 0.16], [108 * B, 0.1]]),
      amber: kf(t, [[0, 0], [18 * B, 0], [19 * B, 0.3], [22 * B, 0.22], [24 * B, 0]]),
      dawn: kf(t, [[0, 0], [107 * B, 0], [112 * B, 1, E.outCubic]]),
      sky: kf(t, [[0, 1], [9 * B, 1], [12 * B, 0, E.inOutCubic], [106 * B, 0], [110 * B, 1, E.outCubic]]),
      lights: kf(t, [[0, 0.16], [4 * B - 0.05, 0.2], [4 * B + 0.9, 0.9, E.outCubic], [12 * B, 0.9], [106 * B, 0.35], [111 * B, 0.95, E.outCubic]]),
      skyY: kf(t, [[0, 0], [105 * B, 0], [106 * B, 120]]),
    };
  }

  function draw(t, cam) {
    const p = params(t);
    ctx.globalCompositeOperation = 'source-over';
    const lg = ctx.createLinearGradient(0, 0, 0, H);
    lg.addColorStop(0, rgba(p.top, 1));
    lg.addColorStop(1, rgba(p.bottom, 1));
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    const blob = (x, y, r, col, a) => {
      if (a <= 0.001) return;
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, rgba(col, a));
      rg.addColorStop(0.45, rgba(col, a * 0.42));
      rg.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const dx = L.drift(t, 0.08, 1) * 120, dy = L.drift(t, 0.07, 2) * 140;
    blob(300 + dx, 520 + dy, 900, VIO, 0.20 * (0.6 + p.lavBloom));
    blob(820 - dx * 0.8, 1380 - dy, 950, LAV, 0.10 + p.lavBloom * 0.22);
    blob(540, 900, 700 + p.lavBloom * 300, LAV, p.lavBloom * 0.20);
    blob(900 + dy * 0.5, 1650, 800, GRN, p.green * 0.45);
    blob(1080, 1000, 800, AMB, p.amber * 0.5);
    // dawn horizon for the end card
    if (p.dawn > 0) {
      const hg = ctx.createLinearGradient(0, 1100, 0, H);
      hg.addColorStop(0, rgba(LAV, 0));
      hg.addColorStop(0.55, rgba(VIO, 0.22 * p.dawn));
      hg.addColorStop(1, rgba(MINT, 0.10 * p.dawn));
      ctx.fillStyle = hg;
      ctx.fillRect(0, 1100, W, H - 1100);
    }
    // moonlight
    blob(760, 420, 520, LAV, 0.22 * p.moon);

    // stars
    ctx.globalCompositeOperation = 'lighter';
    const sy = (cam && cam.starY) || 0;
    for (const s of stars) {
      const tw = 0.55 + 0.45 * Math.sin(t * s.f * 2.2 + s.ph);
      const a = s.a * tw * p.stars;
      if (a < 0.02) continue;
      let y = s.y - sy * s.z - t * 6 * s.z;
      y = ((y % (H * 1.1)) + H * 1.1) % (H * 1.1) - H * 0.05;
      if (s.glow) {
        const rg = ctx.createRadialGradient(s.x, y, 0, s.x, y, s.r * 9);
        rg.addColorStop(0, `rgba(230,222,242,${a * 0.5})`);
        rg.addColorStop(1, 'rgba(230,222,242,0)');
        ctx.fillStyle = rg;
        ctx.fillRect(s.x - s.r * 9, y - s.r * 9, s.r * 18, s.r * 18);
      }
      ctx.fillStyle = `rgba(236,230,248,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    drawSkyline(t, p.sky, p.lights, p.dawn, p.skyY);
  }

  function grain(frame) {
    const r = rng(frame * 7919 + 13);
    css(grainEl, { backgroundPosition: `${(r() * 256) | 0}px ${(r() * 256) | 0}px` });
  }

  g.BG = { build, draw, grain };
})(window);
