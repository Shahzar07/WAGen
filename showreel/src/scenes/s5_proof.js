/* 88 to 96 beats. 48+ businesses trust us across the UAE. Industries burst in on the lift. */
(function () {
  'use strict';
  const { h, css, E, prog, clamp, tw, icon } = L;
  const { Odometer, Words, wordsAnim } = C;

  const CHIPS = [
    { label: 'Restaurants', ic: 'utensils' },
    { label: 'Clinics', ic: 'stethoscope' },
    { label: 'Salons', ic: 'scissors' },
    { label: 'Real Estate', ic: 'building' },
    { label: 'Retail', ic: 'bag' },
  ];

  scene({
    name: 'proof', t0: b(87.4), t1: b(96.6),
    build(root) {
      const T = b(88), LIFT = b(92), OUT = b(95.6);

      // avatar stack like the landing page
      const avs = ['#b292f9', '#8f6ae8', '#c9afff'].map((c, i) => h('div', { class: 'abs', style: { left: `${540 - 92 + i * 56}px`, top: '300px', width: '72px', height: '72px', borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #ffffff55, ${c})`, border: '4px solid #140d20', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' } }));
      avs.forEach(a => root.appendChild(a));

      const numWrap = h('div', { class: 'abs', style: { left: '0', top: '392px', width: '1080px', height: '330px', display: 'flex', justifyContent: 'center' } });
      root.appendChild(numWrap);
      const odo = Odometer(numWrap, { digits: 2, size: 320, color: '#ffffff', suffix: '+', family: 'Poppins', weight: 700, lh: 1.02 });
      css(odo.root, { position: 'relative', letterSpacing: '-0.05em', color: '#ffffff', textShadow: '0 0 60px rgba(178,146,249,0.55)' });
      css(odo.suf, { color: 'var(--lav)' });

      const line = Words(root, { x: 90, y: 740, w: 900, align: 'center', text: 'businesses trust us across the UAE', style: { fontSize: '66px', fontWeight: '600', color: '#fff', lineHeight: '1.18', letterSpacing: '-0.02em', textWrap: 'balance' } });
      const lineH = line.root.getBoundingClientRect().height;

      const chipsWrap = h('div', { class: 'abs', style: { left: '70px', width: '940px', top: `${740 + lineH + 70}px`, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '22px 20px' } });
      root.appendChild(chipsWrap);
      const chips = CHIPS.map(c => {
        const el = h('div', { class: 'pill', style: { height: '94px', padding: '0 38px', fontSize: '38px', gap: '18px', color: 'var(--lav-3)', background: 'rgba(178,146,249,0.10)' } }, h('span', { style: { color: 'var(--lav)', display: 'flex' } }, icon(c.ic, 40, 'currentColor', 2.2)), h('span', null, c.label));
        chipsWrap.appendChild(el);
        return el;
      });

      cue(T + 0.1, 'countRoll', 0.8); cue(T + b(3), 'wordHit', 0.5);
      chips.forEach((c, i) => cue(LIFT + i * b(0.5), 'chip', 0.75, (i - 2) * 0.25));
      cue(OUT - 0.1, 'whoosh', 0.7);

      return function update(t) {
        const out = E.inCubic(prog(t, OUT, OUT + 0.4));
        const g = 1 - out;
        avs.forEach((a, i) => {
          const p = E.spring(prog(t, T + 0.1 + i * 0.08, T + 0.9 + i * 0.08), 0.5, 2);
          css(a, { opacity: (clamp(p * 3) * g).toFixed(3), transform: `translate3d(0,${(-out * 60).toFixed(2)}px,0) scale(${p.toFixed(4)})` });
        });
        const v = 48 * E.outQuart(prog(t, T + 0.05, T + 1.35));
        odo.set(v);
        const ni = E.outExpo(prog(t, T - 0.05, T + 0.5));
        css(numWrap, { opacity: (ni * g).toFixed(3), transform: `translate3d(0,${((1 - ni) * 80 - out * 80).toFixed(2)}px,0) scale(${(0.9 + 0.1 * ni - out * 0.1).toFixed(4)})`, filter: out > 0.01 ? `blur(${(out * 14).toFixed(2)}px)` : 'none' });
        wordsAnim(line.words, t, T + 0.35, OUT, { stagger: 0.05, dur: 0.6 });
        chips.forEach((c, i) => {
          const t0 = LIFT + i * b(0.5);
          const p = E.spring(prog(t, t0, t0 + 0.8), 0.45, 2.2);
          const glow = 1 - tw(t, t0, t0 + 0.9);
          css(c, {
            opacity: (clamp(p * 4) * g).toFixed(3),
            transform: `translate3d(0,${((1 - p) * 70 - out * 70).toFixed(2)}px,0) scale(${(0.5 + 0.5 * p).toFixed(4)}) rotate(${((1 - p) * (i % 2 ? 8 : -8)).toFixed(2)}deg)`,
            borderColor: `rgba(178,146,249,${(0.28 + 0.5 * glow).toFixed(3)})`,
            boxShadow: `0 0 ${(50 * glow).toFixed(1)}px rgba(178,146,249,${(0.5 * glow).toFixed(3)})`,
          });
        });
      };
    },
  });
})();
