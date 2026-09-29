/* 24 to 32 beats. The drop. "One WhatsApp. Every customer answered." Built, trained and run for you. */
(function () {
  'use strict';
  const { h, css, E, prog, clamp, tw } = L;
  const { Words, wordsAnim, typeText } = C;

  scene({
    name: 'solution', t0: b(23.9), t1: b(32.6),
    build(root) {
      const T = b(24), OUT = b(31);
      const eyebrow = h('div', { class: 'abs eyebrow', style: { left: '0', width: '1080px', textAlign: 'center', top: '298px' } });
      root.appendChild(eyebrow);

      const head = h('div', { class: 'abs h-xl', style: { left: '60px', width: '960px', top: '372px', textAlign: 'center', fontSize: '138px', lineHeight: '1.04' } });
      root.appendChild(head);
      const l1 = h('div', { style: { whiteSpace: 'nowrap' } }), l2 = h('div', { class: 'lav', style: { whiteSpace: 'nowrap' } }), l3 = h('div', { class: 'lav', style: { whiteSpace: 'nowrap' } });
      head.append(l1, l2, l3);
      const w1 = L.splitWords(l1, 'One WhatsApp.');
      const w2 = L.splitWords(l2, 'Every customer');
      const w3 = L.splitWords(l3, 'answered.');
      const words = [...w1, ...w2, ...w3];
      // fit the widest line
      let size = 138;
      while ([l1, l2, l3].some(l => l.scrollWidth > 960) && size > 80) { size -= 2; head.style.fontSize = `${size}px`; }
      words.forEach(w => css(w, { transformOrigin: '50% 80%' }));

      const sub = Words(root, { x: 110, y: 372 + head.getBoundingClientRect().height + 44, w: 860, align: 'center', text: 'A WhatsApp AI agent for your business, built, trained and run for you.', style: { fontSize: '46px', color: 'var(--lav-3)', fontWeight: '500', lineHeight: '1.4', textWrap: 'balance' } });

      const hits = [T, T + b(0.5), T + b(1), T + b(1.5), T + b(2)];
      hits.forEach((t0, i) => cue(t0, i === 0 ? 'drop' : 'wordHit', i === 0 ? 1 : 0.55, (i - 2) * 0.15));
      cue(T + b(2.6), 'shimmer', 0.6);
      cue(OUT, 'whoosh', 0.7);

      return function update(t) {
        typeText(eyebrow, 'What we build', t, T + 0.15, 30, OUT, 70);
        words.forEach((w, i) => {
          const t0 = hits[i];
          const a = clamp((t - t0 + 0.03) / 0.08);
          const sp = E.spring(prog(t, t0, t0 + 0.9), 0.48, 2.1);
          const out = E.inCubic(prog(t, OUT + i * 0.03, OUT + i * 0.03 + 0.38));
          const glow = 1 - tw(t, t0, t0 + 1.0);
          css(w, {
            opacity: (a * (1 - out)).toFixed(3),
            transform: `translate3d(0,${((1 - sp) * 60 - out * 120).toFixed(2)}px,0) scale(${(0.35 + 0.65 * sp).toFixed(4)})`,
            filter: a < 1 || sp < 0.9 || out > 0 ? `blur(${(clamp(1 - sp) * 10 + out * 10).toFixed(2)}px)` : 'none',
            textShadow: glow > 0.01 ? `0 0 ${(50 * glow).toFixed(1)}px rgba(201,175,255,${(0.7 * glow).toFixed(3)})` : 'none',
          });
        });
        wordsAnim(sub.words, t, T + b(2.6), OUT - 0.05, { stagger: 0.03, dur: 0.6 });
      };
    },
  });
})();
