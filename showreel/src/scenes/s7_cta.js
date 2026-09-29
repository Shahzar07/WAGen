/* 104 to 117 beats. The short form, a tap, then the end card. */
(function () {
  'use strict';
  const { h, css, E, prog, clamp, lerp, tw, kf, icon } = L;
  const { Lines, lineAnim, Wordmark, Words, wordsAnim } = C;

  scene({
    name: 'cta', t0: b(103.6), t1: 60.1,
    build(root) {
      const T = b(104), TAP = b(106.9), SWAP = b(108), END = 60;

      // Phase 1: the form
      const p1 = h('div', { class: 'layer', style: { transformOrigin: '540px 900px' } });
      root.appendChild(p1);
      const head = Lines(p1, { x: 90, y: 330, w: 900, cls: 'h-l', lines: [{ text: 'Yalla,' }, { text: 'let’s set it up', cls: 'lav' }], maxSize: 112 });
      const hh = head.root.getBoundingClientRect().height;
      const field = (label, ph, prefix) => h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        h('div', { style: { fontSize: '27px', fontWeight: '600', color: 'var(--lav-3)' } }, label),
        h('div', { style: { height: '80px', borderRadius: '22px', border: '2px solid var(--line-2)', background: 'rgba(18,12,25,0.65)', display: 'flex', alignItems: 'center', gap: '14px', padding: '0 22px', fontSize: '28px', color: 'var(--muted-3)', whiteSpace: 'nowrap', overflow: 'hidden' } }, prefix || null, ph));
      const flag = h('div', { style: { width: '44px', height: '30px', borderRadius: '5px', flex: 'none', background: 'linear-gradient(to right, #ef3340 0 26%, transparent 26%), linear-gradient(to bottom, #00843d 0 33.4%, #ffffff 33.4% 66.6%, #111 66.6%)' } });
      const code = h('span', { style: { color: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' } }, flag, '+971', h('span', { style: { width: '2px', height: '36px', background: 'var(--line-2)', marginLeft: '6px' } }));
      const fields = [field('Business Name', 'Your business name'), field('Your Name', 'Full name'), field('Email', 'you@business.ae'), field('WhatsApp Number', '50 123 4567', code)];
      const grid = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px 24px', marginTop: '28px' } }, ...fields);
      const btn1 = h('div', { class: 'btn', style: { width: '100%', height: '104px', marginTop: '34px', fontSize: '36px', position: 'relative', overflow: 'hidden' } }, 'Next: Pick Your Demo Time');
      const ripple = h('div', { style: { position: 'absolute', left: '50%', top: '50%', width: '0px', height: '0px', borderRadius: '50%', background: 'rgba(255,255,255,0.55)' } });
      btn1.appendChild(ripple);
      const steps = h('div', { style: { display: 'flex', alignItems: 'center', gap: '20px' } },
        h('div', { style: { fontSize: '28px', color: 'var(--muted)', fontWeight: '500' } }, 'Step 1 of 2. Your details.'),
        h('div', { style: { marginLeft: 'auto', display: 'flex', gap: '10px' } }, h('div', { style: { width: '90px', height: '8px', borderRadius: '4px', background: 'var(--lav)' } }), h('div', { style: { width: '90px', height: '8px', borderRadius: '4px', background: 'rgba(178,146,249,0.22)' } })));
      const form = h('div', { class: 'abs card', style: { left: '90px', top: `${330 + hh + 56}px`, width: '900px', padding: '34px 34px 36px' } }, steps, grid, btn1);
      p1.appendChild(form);
      const cursor = h('div', { class: 'abs', style: { left: '0', top: '0', width: '84px', height: '84px', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.6))' } });
      cursor.innerHTML = '<svg width="84" height="84" viewBox="0 0 24 24"><path d="M5.5 3.2l13.2 7.1c.7.4.6 1.4-.2 1.6l-5.3 1.4c-.3.1-.6.3-.7.6l-2.2 5c-.3.8-1.4.7-1.6-.1L4.1 4.5c-.2-.8.7-1.5 1.4-1.3z" fill="#fff" stroke="#1a1128" stroke-width="1.2" stroke-linejoin="round"/></svg>';
      p1.appendChild(cursor);
      const btnRect = () => ({ x: 540, y: 330 + hh + 56 + form.getBoundingClientRect().height - 36 - 52 });
      const BR = btnRect();

      // Phase 2: end card
      const p2 = h('div', { class: 'layer' });
      root.appendChild(p2);
      const wm = Wordmark(p2, { x: 0, y: 318, size: 104 });
      const wmRect = wm.getBoundingClientRect();
      css(wm, { left: `${540 - wmRect.width / 2}px`, textAlign: 'center' });
      const endHead = Lines(p2, { x: 90, y: 318 + wmRect.height + 70, w: 900, cls: 'h-xl', align: 'center', lines: [{ text: 'Sleep easy.' }, { text: 'We’ve got this.', cls: 'lav' }], maxSize: 128 });
      const ehH = endHead.root.getBoundingClientRect().height;
      const yBtn = 318 + wmRect.height + 70 + ehH + 64;
      const shine = h('div', { style: { position: 'absolute', top: '0', bottom: '0', left: '-40%', width: '30%', background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)', transform: 'skewX(-18deg)' } });
      const btn2 = h('div', { class: 'btn', style: { position: 'absolute', top: `${yBtn}px`, left: '0', height: '124px', fontSize: '44px', padding: '0 66px', overflow: 'hidden' } }, h('span', { style: { position: 'relative' } }, 'Get My Free Demo'), h('span', { style: { position: 'relative', display: 'flex' } }, icon('arrowRight', 46, '#1a1128', 2.8)), shine);
      p2.appendChild(btn2);
      const bw = btn2.getBoundingClientRect().width;
      css(btn2, { left: `${540 - bw / 2}px` });
      const url = h('div', { class: 'abs', style: { top: `${yBtn + 124 + 44}px`, left: '0', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '44px', fontWeight: '600', color: 'var(--lav-3)', whiteSpace: 'nowrap', letterSpacing: '-0.01em' } }, h('span', { style: { color: 'var(--lav)', display: 'flex' } }, icon('globe', 44, 'currentColor', 2.2)), h('span', { class: 'u' }, ''));
      p2.appendChild(url);
      const urlText = url.querySelector('.u');
      const URL_T = 'noshaiautomation.com/whatsappuae';
      urlText.textContent = URL_T;
      const uw = url.getBoundingClientRect().width;
      css(url, { left: `${540 - uw / 2}px` });
      const under = h('div', { class: 'abs', style: { top: `${yBtn + 124 + 44 + 64}px`, left: `${540 - uw / 2 + 60}px`, width: `${uw - 60}px`, height: '3px', borderRadius: '2px', background: 'linear-gradient(90deg, var(--lav), var(--mint))', transformOrigin: '0 50%' } });
      p2.appendChild(under);
      const fine = Words(p2, { x: 110, y: yBtn + 124 + 44 + 110, w: 860, align: 'center', text: 'Fill the short form. The Nosh team reaches out to set up your free live demo.', style: { fontSize: '34px', lineHeight: '1.4', color: 'var(--muted)', textWrap: 'balance' } });

      cue(T, 'whoosh', 0.7); cue(T + b(0.6), 'swoosh', 0.6);
      cue(TAP, 'tap', 1.0); cue(SWAP - 0.3, 'whooshUp', 0.8); cue(SWAP, 'finale', 1.0);
      cue(SWAP + b(2), 'shimmer', 0.7); cue(SWAP + b(3), 'typeRun', 0.6);

      return function update(t) {
        // phase 1
        const out1 = E.inCubic(prog(t, SWAP - 0.3, SWAP + 0.05));
        css(p1, { opacity: (1 - out1).toFixed(3), transform: `scale(${(1 - out1 * 0.12).toFixed(4)})`, filter: out1 > 0.01 ? `blur(${(out1 * 16).toFixed(2)}px)` : 'none', visibility: t < SWAP + 0.1 ? 'visible' : 'hidden' });
        if (t < SWAP + 0.1) {
          lineAnim(head.items, t, T + 0.05, null, { stagger: 0.09, dur: 0.75 });
          const fa = E.spring(prog(t, T + 0.25, T + 1.2), 0.62, 1.5);
          css(form, { opacity: clamp(fa * 2).toFixed(3), transform: `perspective(2000px) translate3d(0,${((1 - fa) * 300).toFixed(2)}px,0) rotateX(${((1 - fa) * 30).toFixed(2)}deg)` });
          fields.forEach((f, i) => {
            const a = E.outCubic(prog(t, T + 0.5 + i * 0.09, T + 0.95 + i * 0.09));
            css(f, { opacity: a.toFixed(3), transform: `translate3d(0,${((1 - a) * 24).toFixed(2)}px,0)` });
          });
          // cursor path to the button, tap, ripple
          const cx = kf(t, [[T + 1.0, 1020], [TAP - 0.05, BR.x + 120, E.inOutCubic]]);
          const cy = kf(t, [[T + 1.0, 1500], [TAP - 0.05, BR.y + 10, E.inOutCubic]]);
          const press = Math.sin(prog(t, TAP - 0.05, TAP + 0.2) * Math.PI);
          css(cursor, { opacity: clamp((t - T - 1.0) * 4).toFixed(3), transform: `translate3d(${(cx - 10).toFixed(2)}px,${(cy - 6).toFixed(2)}px,0) scale(${(1 - press * 0.15).toFixed(3)})` });
          css(btn1, { transform: `scale(${(1 - press * 0.035).toFixed(4)})` });
          const rp = prog(t, TAP, TAP + 0.6);
          const rr = E.outCubic(rp) * 900;
          css(ripple, { width: `${rr}px`, height: `${rr}px`, marginLeft: `${-rr / 2 + 120}px`, marginTop: `${-rr / 2}px`, opacity: (t > TAP ? (1 - rp) * 0.7 : 0).toFixed(3) });
        }
        // phase 2
        css(p2, { visibility: t > SWAP - 0.1 ? 'visible' : 'hidden' });
        if (t > SWAP - 0.1) {
          const wa = E.outExpo(prog(t, SWAP, SWAP + 0.9));
          css(wm, { opacity: wa.toFixed(3), transform: `scale(${(1.25 - 0.25 * wa).toFixed(4)})`, filter: wa < 0.99 ? `blur(${((1 - wa) * 20).toFixed(2)}px)` : 'none', letterSpacing: `${((1 - wa) * 0.2).toFixed(3)}em` });
          lineAnim(endHead.items, t, SWAP + b(1), null, { stagger: 0.1, dur: 0.85 });
          const ba = E.spring(prog(t, SWAP + b(2), SWAP + b(2) + 0.9), 0.5, 2);
          const breathe = t > SWAP + b(4) ? 0.5 + 0.5 * Math.sin((t - SWAP) * 3.2) : 0;
          css(btn2, { opacity: clamp(ba * 3).toFixed(3), transform: `scale(${(0.6 + 0.4 * ba).toFixed(4)})`, boxShadow: `0 24px 70px rgba(178,146,249,${(0.35 + 0.25 * breathe).toFixed(3)}), 0 0 ${(30 + 30 * breathe).toFixed(1)}px rgba(178,146,249,${(0.3 + 0.3 * breathe).toFixed(3)})` });
          const sh = ((t - SWAP - b(2.5)) % 1.6) / 1.6;
          css(shine, { transform: `translate3d(${(t > SWAP + b(2.5) ? sh * 520 : 0).toFixed(1)}%,0,0) skewX(-18deg)`, opacity: t > SWAP + b(2.5) ? '1' : '0' });
          const n = Math.floor(clamp((t - SWAP - b(3)) * 34, 0, URL_T.length));
          const txt = URL_T.slice(0, n);
          if (urlText.textContent !== txt) urlText.textContent = txt;
          css(url, { opacity: clamp((t - SWAP - b(3)) * 5).toFixed(3) });
          css(under, { transform: `scaleX(${E.inOutCubic(prog(t, SWAP + b(3) + 0.3, SWAP + b(3) + 1.3)).toFixed(4)})` });
          wordsAnim(fine.words, t, SWAP + b(5), null, { stagger: 0.025, dur: 0.6 });
        }
      };
    },
  });
})();
