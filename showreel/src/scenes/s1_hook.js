/* 0 to 10 beats. Night. "You sleep." Messages arrive. "Your business doesn't." Replies land instantly. */
(function () {
  'use strict';
  const { h, css, E, prog, clamp, lerp, kf, tw } = L;
  const { Lines, Notification, Pill, wordsAnim } = C;

  scene({
    name: 'hook', t0: 0, t1: b(10.2),
    build(root) {
      // Pill
      const pill = Pill(root, { x: 0, y: 296, text: 'Ahlan! Built for UAE businesses' });
      const pw = pill.getBoundingClientRect().width;
      css(pill, { left: `${540 - pw / 2}px` });

      // Moon and time
      const moon = h('div', { class: 'abs', style: { left: '440px', top: '410px', width: '200px', height: '200px', filter: 'drop-shadow(0 0 26px rgba(201,175,255,0.85)) drop-shadow(0 0 70px rgba(178,146,249,0.55))' } });
      moon.innerHTML = '<svg width="200" height="200" viewBox="-100 -100 200 200"><defs><mask id="mm"><rect x="-100" y="-100" width="200" height="200" fill="#fff"/><circle cx="30" cy="-22" r="56" fill="#000"/></mask><radialGradient id="mg" cx="35%" cy="35%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9c8ff"/></radialGradient></defs><circle r="60" fill="url(#mg)" mask="url(#mm)"/></svg>';
      root.appendChild(moon);
      const clock = h('div', { class: 'abs mono', style: { left: '0', width: '1080px', top: '612px', textAlign: 'center', fontSize: '34px', fontWeight: '700', letterSpacing: '0.18em', color: 'var(--lav-2)' } }, '11:12 PM');
      root.appendChild(clock);

      // Headline group, exits as one block
      const group = h('div', { class: 'layer', style: { transformOrigin: '540px 620px' } });
      root.appendChild(group);
      // "You sleep."
      const sleep = Lines(group, { x: 90, y: 676, w: 900, align: 'center', cls: 'h-xl', lines: [{ text: 'You sleep.' }], maxSize: 150 });
      css(sleep.root, { transformOrigin: '540px 0px' });
      const sleepChars = L.splitWords(sleep.items[0].inner, 'You sleep.', { chars: true });

      // "Your business doesn't."
      const biz = h('div', { class: 'abs h-xl lav', style: { left: '60px', width: '960px', top: '522px', textAlign: 'center', fontSize: '126px', lineHeight: '1.04' } });
      group.appendChild(biz);
      const bizWords = L.splitWords(biz, 'Your business doesn’t.');
      biz.insertBefore(h('br'), bizWords[2]);
      bizWords.forEach(w => css(w, { transformOrigin: '50% 60%' }));

      // Notifications (the landing page chat examples)
      const n1 = Notification(root, { x: 90, y: 0, text: 'Do you have a table for four tonight at 8?', time: '9:41 PM', replied: 'Replied in 4 seconds' });
      const n2 = Notification(root, { x: 90, y: 0, text: 'كم سعر جلسة التنظيف؟', ar: true, time: '11:12 PM', replied: 'Replied in 3 seconds' });
      const h1 = n1.el.getBoundingClientRect().height, h2 = n2.el.getBoundingClientRect().height;
      const repH = 46, repM = 8, gap = 16;
      const A1 = 900, B1 = 808;
      window.__hookCards = [
        { x: 90, y: B1, w: 900, h: h1 + repH + repM },
        { x: 90, y: B1 + h1 + repH + repM + gap, w: 900, h: h2 + repH + repM },
      ];

      const T_n1 = b(1.6), T_n2 = b(2.9), HIT = b(4), R1 = b(5), R2 = b(6), OUT = b(8);
      cue(T_n1, 'notify', 0.9); cue(T_n2, 'notify', 0.9, 0.1);
      cue(HIT, 'impact', 1.0); cue(HIT - 0.45, 'riserShort', 0.6);
      cue(R1, 'reply', 0.9, -0.1); cue(R2, 'reply', 0.9, 0.1);
      cue(OUT + b(0.3), 'shatter', 0.9);

      return function update(t) {
        // pill
        const pa = 0.55 + 0.45 * E.outCubic(prog(t, 0, 0.6)), po = E.inCubic(prog(t, OUT - 0.1, OUT + 0.3));
        css(pill, { opacity: (pa * (1 - po)).toFixed(3), transform: `translate3d(0,${((1 - pa) * -24 - po * 30).toFixed(2)}px,0)` });

        // moon rises, then drifts up and away on the hit
        const ma = 0.6 + 0.4 * E.outCubic(prog(t, 0, 0.9));
        const mo = E.inOutCubic(prog(t, HIT - 0.35, HIT + 0.35));
        css(moon, { opacity: (ma * (1 - mo)).toFixed(3), transform: `translate3d(${(mo * 260).toFixed(2)}px,${((1 - ma) * 40 - mo * 170).toFixed(2)}px,0) scale(${(1 - mo * 0.45).toFixed(3)}) rotate(${(-12 + t * 3).toFixed(2)}deg)` });
        const ca = 0.5 + 0.5 * E.outCubic(prog(t, 0, 0.6));
        css(clock, { opacity: (ca * (1 - mo)).toFixed(3), transform: `translate3d(0,${(-mo * 60).toFixed(2)}px,0)`, letterSpacing: `${(0.18 + (1 - ca) * 0.3).toFixed(3)}em` });

        // "You sleep." soft float in, then lifts to the top on the hit
        sleepChars.forEach(w => w.__chars.forEach((ch, i) => {
          const k = i + (w === sleepChars[1] ? 4 : 0);
          const a = E.outCubic(prog(t, 0.1 + k * 0.045, 0.1 + k * 0.045 + 0.9));
          css(ch, { opacity: a.toFixed(3), transform: `translate3d(0,${((1 - a) * 46).toFixed(2)}px,0)`, filter: a > 0.99 ? 'none' : `blur(${((1 - a) * 16).toFixed(2)}px)` });
        }));
        const lift = E.snap(prog(t, HIT - 0.3, HIT + 0.25));
        css(sleep.root, { transform: `translate3d(0,${(lift * -306).toFixed(2)}px,0) scale(${(1 - lift * 0.13).toFixed(4)})` });
        const gOut = E.inQuart(prog(t, OUT + 0.05, OUT + 0.42));
        css(group, { opacity: (1 - gOut).toFixed(3), transform: `translate3d(0,${(-gOut * 90).toFixed(2)}px,0) scale(${(1 - gOut * 0.12).toFixed(4)})`, filter: gOut > 0.001 ? `blur(${(gOut * 18).toFixed(2)}px)` : 'none' });

        // "Your business doesn't." slams in on the beat
        bizWords.forEach((w, i) => {
          const t0 = HIT + i * 0.075;
          const a = prog(t, t0 - 0.02, t0 + 0.1);
          const sp = E.spring(prog(t, t0, t0 + 0.7), 0.5, 2.4);
          css(w, {
            opacity: a.toFixed(3),
            transform: `scale(${(1.32 - 0.32 * sp).toFixed(4)})`,
            filter: sp > 0.97 ? 'none' : `blur(${(clamp(1 - sp) * 14).toFixed(2)}px)`,
            textShadow: `0 0 ${(40 * (1 - tw(t, t0, t0 + 1.2)) + 18).toFixed(1)}px rgba(178,146,249,${(0.25 + 0.5 * (1 - tw(t, t0, t0 + 1.2))).toFixed(3)})`,
          });
        });

        // notifications
        const move = E.glide(prog(t, HIT - 0.3, HIT + 0.5));
        const shat = prog(t, OUT + b(0.3), OUT + b(0.3) + 0.18);
        const base1 = lerp(A1, B1, move);
        const r1 = E.outCubic(prog(t, R1, R1 + 0.35));
        const base2 = base1 + h1 + gap + r1 * (repH + repM);
        [[n1, T_n1, base1, R1], [n2, T_n2, base2, R2]].forEach(([n, t0, yb, tr]) => {
          const a = E.spring(prog(t, t0, t0 + 0.9), 0.6, 1.7);
          const o = clamp(prog(t, t0, t0 + 0.25));
          const y = yb + (1 - a) * 160;
          const buzz = t > t0 && t < t0 + 0.45 ? Math.sin((t - t0) * 90) * 7 * (1 - prog(t, t0, t0 + 0.45)) : 0;
          css(n.el, { top: `${y.toFixed(2)}px`, opacity: (o * (1 - shat)).toFixed(3), transform: `translate3d(${buzz.toFixed(2)}px,0,0) scale(${(0.92 + 0.08 * a - shat * 0.04).toFixed(4)})` });
          const r = E.outCubic(prog(t, tr, tr + 0.35));
          css(n.rep, { height: `${(r * repH).toFixed(2)}px`, opacity: r.toFixed(3), marginTop: `${(r * repM).toFixed(2)}px` });
          const glow = 1 - tw(t, tr, tr + 0.9);
          css(n.el, { borderColor: `rgba(${lerp(255, 157, r) | 0},${lerp(255, 232, r) | 0},${lerp(255, 176, r) | 0},${(0.11 + 0.3 * r * glow + 0.1 * r).toFixed(3)})`, boxShadow: `0 30px 80px rgba(0,0,0,0.45), 0 0 ${(60 * glow * r).toFixed(1)}px rgba(157,232,176,${(0.35 * glow * r).toFixed(3)}), 0 1px 0 rgba(255,255,255,0.10) inset` });
        });
      };
    },
  });
})();
