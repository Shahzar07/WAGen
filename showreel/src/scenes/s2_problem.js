/* 8 to 24 beats. The notifications shatter into 84 messages. 84 never answered. ~26 customers lost. Implode into the drop. */
(function () {
  'use strict';
  const { h, css, E, prog, clamp, lerp, kf, tw, rng, noise1 } = L;
  const { Lines, lineAnim, Odometer, typeText } = C;

  const N = 84, COLS = 12, ROWS = 7, CELL = 66, BW = 48, BH = 38;
  const GX = 540 - (COLS * CELL) / 2, GY = 782;
  const LOST = 26;

  scene({
    name: 'problem', t0: b(8.2), t1: b(24.35),
    build(root) {
      const T_SHATTER = b(8.3), T_HEAD = b(10), T_LAND0 = b(14), T_LAND1 = b(17.4), T_LOST = b(18), T_GATHER = b(21.6), T_DROP = b(24);

      const canvas = h('canvas', { width: 1080, height: 1920, class: 'layer' });
      root.appendChild(canvas);
      const ctx = canvas.getContext('2d');

      const eyebrow = h('div', { class: 'abs eyebrow', style: { left: '90px', top: '298px' } });
      root.appendChild(eyebrow);
      const head = Lines(root, { x: 90, y: 560, w: 900, cls: 'h-l', align: 'left', lines: [{ text: 'Missed messages' }, { text: '= lost customers.', cls: 'lav' }], maxSize: 112 });
      css(head.root, { transformOrigin: '0px 0px' });

      // Stat blocks
      const statA = h('div', { class: 'abs', style: { left: '90px', top: '520px', width: '900px', height: '240px' } });
      const odoA = Odometer(statA, { digits: 2, size: 224, x: 0, y: 0 });
      const labA = h('div', { class: 'abs', style: { left: '330px', top: '42px', width: '560px', fontSize: '46px', fontWeight: '600', lineHeight: '1.25', color: 'var(--lav-3)' } }, 'Messages never', h('br'), 'answered ', h('span', { style: { color: 'var(--muted-2)' } }, '/ day'));
      statA.appendChild(labA);
      root.appendChild(statA);
      const statB = h('div', { class: 'abs', style: { left: '90px', top: '520px', width: '900px', height: '240px' } });
      const odoB = Odometer(statB, { digits: 2, size: 224, x: 0, y: 0, prefix: '~' });
      const labB = h('div', { class: 'abs', style: { left: '470px', top: '42px', width: '430px', fontSize: '46px', fontWeight: '600', lineHeight: '1.25', color: 'var(--lav-3)' } }, 'Customers lost', h('br'), 'to competitors');
      statB.appendChild(labB);
      root.appendChild(statB);

      // Particles
      const r = rng(84);
      const cards = window.__hookCards || [{ x: 90, y: 842, w: 900, h: 220 }, { x: 90, y: 1080, w: 900, h: 170 }];
      const order = [...Array(N).keys()].sort(() => r() - 0.5);
      const lostSet = new Set();
      const rl = rng(26);
      while (lostSet.size < LOST) lostSet.add(Math.floor(rl() * N));
      const P = [];
      for (let i = 0; i < N; i++) {
        const c = cards[i % 2 === 0 || cards.length < 2 ? 0 : 1];
        const col = i % COLS, row = Math.floor(i / COLS);
        const landRank = order.indexOf(i);
        P.push({
          sx: c.x + 40 + r() * (c.w - 80), sy: c.y + 20 + r() * (c.h - 40),
          bx: 110 + r() * 860, by: 900 + r() * 640,
          gx: GX + col * CELL + (CELL - BW) / 2, gy: GY + row * CELL + (CELL - BH) / 2,
          rot0: (r() - 0.5) * 80, sc: 0.7 + r() * 0.6, seed: r() * 100,
          tl: T_LAND0 + (landRank / (N - 1)) * (T_LAND1 - T_LAND0 - 0.45),
          lost: lostSet.has(i), lostRank: 0,
          vx: 900 + r() * 700, vy: (r() - 0.5) * 380,
        });
      }
      let k = 0;
      P.filter(p => p.lost).sort((a, b2) => a.gx - b2.gx + (a.gy - b2.gy) * 0.2).forEach(p => { p.lostRank = k++; });

      cue(T_HEAD, 'typeTick', 0.5);
      cue(T_HEAD + 0.15, 'whoosh', 0.7);
      cue(T_LAND0, 'countRoll', 0.9);
      cue(T_LOST, 'lostSweep', 1.0);
      cue(T_LOST + 0.35, 'whooshLong', 0.8, 0.4);
      cue(T_GATHER - 0.2, 'riser', 1.0);
      cue(T_DROP - 0.9, 'suck', 0.8);

      function bubble(x, y, w, hh, rot, fill, stroke, alpha, tick) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x + w / 2, y + hh / 2);
        ctx.rotate(rot * Math.PI / 180);
        ctx.translate(-w / 2, -hh / 2);
        const rr = hh * 0.34;
        ctx.beginPath();
        ctx.moveTo(rr, 0);
        ctx.lineTo(w - rr, 0); ctx.quadraticCurveTo(w, 0, w, rr);
        ctx.lineTo(w, hh - rr); ctx.quadraticCurveTo(w, hh, w - rr, hh);
        ctx.lineTo(hh * 0.3, hh); ctx.lineTo(-hh * 0.12, hh + hh * 0.2); ctx.lineTo(0, hh - rr * 0.6);
        ctx.lineTo(0, rr); ctx.quadraticCurveTo(0, 0, rr, 0);
        ctx.closePath();
        ctx.fillStyle = fill; ctx.fill();
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
        if (tick) {
          ctx.strokeStyle = tick; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(w * 0.62, hh * 0.52); ctx.lineTo(w * 0.7, hh * 0.64); ctx.lineTo(w * 0.84, hh * 0.38); ctx.stroke();
        }
        ctx.restore();
      }

      return function update(t) {
        ctx.clearRect(0, 0, 1080, 1920);

        // Headline: big, then docks to the top as a subhead
        typeText(eyebrow, 'The problem', t, T_HEAD, 30, T_DROP - 0.9, 60);
        lineAnim(head.items, t, T_HEAD + 0.1, T_GATHER + 0.2, { stagger: 0.09, dur: 0.8 });
        const dock = E.snap(prog(t, T_LAND0 - 0.35, T_LAND0 + 0.25));
        css(head.root, { transform: `translate3d(0,${(dock * -206).toFixed(2)}px,0) scale(${(1 - dock * 0.46).toFixed(4)})` });

        // Stat A (84)
        const landed = P.reduce((s, p) => s + E.outCubic(prog(t, p.tl + 0.25, p.tl + 0.45)), 0);
        odoA.set(landed);
        const aIn = E.outExpo(prog(t, T_LAND0 - 0.1, T_LAND0 + 0.5));
        const aOut = E.inOutCubic(prog(t, T_LOST - 0.05, T_LOST + 0.45));
        css(statA, { opacity: (aIn * (1 - aOut)).toFixed(3), transform: `translate3d(${(-aOut * 420).toFixed(2)}px,${((1 - aIn) * 60).toFixed(2)}px,0)`, filter: aOut > 0.01 ? `blur(${(aOut * 10).toFixed(2)}px)` : 'none' });
        css(labA, { opacity: E.outCubic(prog(t, T_LAND0 + 0.25, T_LAND0 + 0.7)).toFixed(3) });

        // Stat B (~26)
        const lostCount = P.reduce((s, p) => s + (p.lost ? E.outCubic(prog(t, T_LOST + p.lostRank * 0.028, T_LOST + p.lostRank * 0.028 + 0.2)) : 0), 0);
        odoB.set(lostCount);
        const bIn = E.outExpo(prog(t, T_LOST + 0.1, T_LOST + 0.7));
        const bOut = E.inCubic(prog(t, T_GATHER + 0.3, T_GATHER + 0.8));
        css(statB, { opacity: (bIn * (1 - bOut)).toFixed(3), transform: `translate3d(${((1 - bIn) * 420).toFixed(2)}px,0,0) scale(${(1 - bOut * 0.25).toFixed(4)})`, transformOrigin: '450px 120px', filter: bOut > 0.01 ? `blur(${(bOut * 12).toFixed(2)}px)` : 'none' });

        // Bubbles
        const gather = E.inExpo(prog(t, T_GATHER, T_DROP));
        const gcx = 540, gcy = 900;
        for (const p of P) {
          const burst = E.outExpo(prog(t, T_SHATTER, T_SHATTER + 1.1));
          const t0 = T_SHATTER;
          if (t < t0) continue;
          // cloud drift
          const nx = noise1(t * 0.35, p.seed) * 60, ny = noise1(t * 0.3, p.seed + 3) * 70 - (t - t0) * 12;
          let x = lerp(p.sx, p.bx + nx, burst), y = lerp(p.sy, p.by + ny, burst);
          let rot = p.rot0 * burst + noise1(t * 0.5, p.seed + 9) * 20;
          let sc = lerp(0.6, p.sc, burst);
          let alpha = lerp(1, 0.34, burst) * (1 - 0.35 * E.outCubic(prog(t, T_HEAD, T_HEAD + 0.6)) * (1 - E.outCubic(prog(t, T_LAND0 - 0.4, T_LAND0))));
          let fill = 'rgba(230,222,242,1)', stroke = null, tick = null;
          // land into the grid
          const land = E.inOutCubic(prog(t, p.tl, p.tl + 0.45));
          if (land > 0) {
            x = lerp(x, p.gx, land); y = lerp(y, p.gy, land);
            rot = lerp(rot, 0, land); sc = lerp(sc, 1, land) + Math.sin(prog(t, p.tl + 0.4, p.tl + 0.7) * Math.PI) * 0.18;
            alpha = lerp(alpha, 1, land);
            if (land > 0.85) { fill = '#241a3a'; stroke = 'rgba(178,146,249,0.42)'; tick = 'rgba(185,176,201,0.75)'; }
          }
          // the lost ones turn amber and leave
          if (p.lost) {
            const tl0 = T_LOST + p.lostRank * 0.028;
            const warm = prog(t, tl0, tl0 + 0.2);
            if (warm > 0) { fill = `rgba(242,166,90,${lerp(0.25, 1, warm)})`; stroke = 'rgba(255,200,140,0.9)'; tick = null; }
            const go = prog(t, tl0 + 0.3, tl0 + 1.6);
            if (go > 0) {
              const e = E.inCubic(go);
              // streak
              for (let s = 1; s <= 4; s++) {
                const es = E.inCubic(Math.max(0, go - s * 0.03));
                bubble(x + p.vx * es, y + p.vy * es, BW, BH, e * 25, 'rgba(242,166,90,1)', null, (1 - go) * 0.12 * (5 - s), null);
              }
              x += p.vx * e; y += p.vy * e; rot += e * 25; alpha *= 1 - E.inQuad(go);
            }
          }
          // gather into the singularity
          if (gather > 0 && !p.lost) {
            x = lerp(x, gcx - BW / 2, gather); y = lerp(y, gcy - BH / 2, gather);
            sc *= 1 - gather * 0.9; rot += gather * 180;
            fill = gather > 0.3 ? `rgba(201,175,255,${0.6 + gather * 0.4})` : fill;
          }
          if (alpha > 0.01) bubble(x, y, BW * sc, BH * sc, rot, fill, stroke, alpha, tick);
        }
        // core glow as everything collapses
        if (gather > 0.05) {
          const g2 = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, 60 + gather * 140);
          g2.addColorStop(0, `rgba(255,255,255,${0.9 * gather})`);
          g2.addColorStop(0.3, `rgba(201,175,255,${0.7 * gather})`);
          g2.addColorStop(1, 'rgba(178,146,249,0)');
          ctx.fillStyle = g2;
          ctx.fillRect(0, 0, 1080, 1920);
        }
        const fade = E.outCubic(prog(t, T_DROP, T_DROP + 0.1));
        css(canvas, { opacity: (1 - fade).toFixed(3) });
      };
    },
  });
})();
