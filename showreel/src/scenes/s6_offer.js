/* 96 to 104 beats. Free demo terms, checked off on the beat. */
(function () {
  'use strict';
  const { h, css, E, prog, clamp, tw } = L;
  const { Lines, lineAnim, CheckRow, typeText } = C;

  scene({
    name: 'offer', t0: b(95.8), t1: b(104.5),
    build(root) {
      const T = b(96), OUT = b(103.3);
      const eyebrow = h('div', { class: 'abs eyebrow', style: { left: '90px', top: '298px' } });
      root.appendChild(eyebrow);
      const head = Lines(root, { x: 90, y: 356, w: 900, cls: 'h-l', lines: [{ text: 'See it answer' }, { text: 'your own customer' }, { text: 'questions.', cls: 'lav' }], maxSize: 100 });
      const hh = head.root.getBoundingClientRect().height;

      const items = ['Free, with no commitment.', 'Pick a demo time that suits you.', 'Nothing changes on your current number until you approve it.'];
      let y = 356 + hh + 64;
      const rows = items.map((text, i) => {
        const r = CheckRow(root, { x: 90, y, w: 900, text, size: 44 });
        y += r.el.getBoundingClientRect().height + 34;
        r.t = T + b(2 + i * 1.5);
        return r;
      });
      cue(T + 0.1, 'typeTick', 0.5);
      rows.forEach(r => { cue(r.t, 'swish', 0.5); cue(r.t + 0.22, 'check', 0.9); });
      cue(OUT, 'whoosh', 0.7);

      return function update(t) {
        typeText(eyebrow, 'Free demo', t, T + 0.05, 28, OUT, 60);
        lineAnim(head.items, t, T + 0.08, OUT, { stagger: 0.08, dur: 0.75 });
        rows.forEach((r, i) => {
          const a = E.outExpo(prog(t, r.t, r.t + 0.6));
          const o = E.inCubic(prog(t, OUT + i * 0.05, OUT + i * 0.05 + 0.35));
          css(r.el, { opacity: (clamp(a * 1.5) * (1 - o)).toFixed(3), transform: `translate3d(${((1 - a) * -80 - o * 60).toFixed(2)}px,0,0)` });
          const ck = E.outCubic(prog(t, r.t + 0.2, r.t + 0.55));
          r.path.setAttribute('stroke-dashoffset', (1 - ck).toFixed(3));
          const glow = 1 - tw(t, r.t + 0.2, r.t + 1.1);
          const pop = Math.sin(prog(t, r.t + 0.2, r.t + 0.6) * Math.PI);
          css(r.box, { transform: `scale(${(1 + pop * 0.18).toFixed(3)})`, boxShadow: `0 0 ${(40 * glow * (t > r.t + 0.2 ? 1 : 0)).toFixed(1)}px rgba(157,232,176,${(0.6 * glow).toFixed(3)})` });
        });
      };
    },
  });
})();
