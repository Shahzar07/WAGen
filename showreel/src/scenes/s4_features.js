/* 32 to 88 beats. Seven features, two bars each, one continuous product story. */
(function () {
  'use strict';
  const { h, s, css, E, prog, clamp, lerp, kf, tw, icon } = L;
  const { Lines, lineAnim, Words, wordsAnim, ChatCard, Wordmark } = C;

  const FT = [32, 40, 48, 56, 64, 72, 80, 88].map(n => b(n));
  const FEATURES = [
    { title: ['Instant replies'], desc: 'Answered the moment they message, day or night.' },
    { title: ['English + Arabic'], desc: 'It switches language when the customer does.' },
    { title: ['Books the job'], desc: 'while the customer is still in the chat.' },
    { title: ['Fits your systems'], desc: 'Connects to your booking system, CRM or POS.' },
    { title: ['Your number', 'stays yours'], desc: 'Keep the number customers already message. Setup handled by us.' },
    { title: ['Your team can', 'take over'], desc: 'Complex cases hand over automatically.' },
    { title: ['Kept up to date'], desc: 'You tell us and we update the agent.' },
  ];
  const AR_Q = 'كم سعر جلسة التنظيف؟';
  const AR_A = 'جلسة التنظيف 250 درهم وتستغرق 45 دقيقة. متاح غدا الساعة 11 صباحا.';

  const circleIcon = (name, bg, fg, size = 64, isz = 34) => h('div', { style: { width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' } }, icon(name, isz, fg, 2.4));
  const squareIcon = (name, size = 76, isz = 38) => h('div', { style: { width: `${size}px`, height: `${size}px`, borderRadius: '22px', background: 'rgba(178,146,249,0.12)', border: '2px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', color: 'var(--lav-2)' } }, icon(name, isz, 'currentColor', 2.2));

  scene({
    name: 'features', t0: b(27.5), t1: b(88.6),
    build(root) {
      // Header: index, progress, brand
      const hdr = h('div', { class: 'layer' });
      root.appendChild(hdr);
      const digit = h('div', { style: { display: 'flex', flexDirection: 'column' } }, ...[1, 2, 3, 4, 5, 6, 7].map(k => h('div', { style: { height: '40px', lineHeight: '40px' } }, String(k))));
      const idx = h('div', { class: 'abs mono', style: { left: '90px', top: '292px', height: '40px', display: 'flex', alignItems: 'center', fontSize: '30px', fontWeight: '700', color: 'var(--lav-2)', letterSpacing: '0.1em' } },
        h('span', null, '0'), h('div', { style: { height: '40px', overflow: 'hidden' } }, digit), h('span', { style: { color: 'var(--muted-3)', marginLeft: '12px' } }, '/ 07'));
      hdr.appendChild(idx);
      const segs = [...Array(7)].map((_, k) => {
        const fill = h('div', { style: { position: 'absolute', left: '0', top: '0', bottom: '0', width: '0%', background: 'var(--lav)', borderRadius: '3px', boxShadow: '0 0 12px rgba(178,146,249,0.8)' } });
        const seg = h('div', { class: 'abs', style: { left: `${278 + k * 50}px`, top: '309px', width: '40px', height: '6px', borderRadius: '3px', background: 'rgba(178,146,249,0.2)', overflow: 'hidden' } }, fill);
        hdr.appendChild(seg);
        return fill;
      });
      const wm = Wordmark(hdr, { x: 0, y: 288, size: 34 });
      css(wm, { left: `${990 - wm.getBoundingClientRect().width}px` });

      // Titles and descriptions
      const blocks = FEATURES.map(f => {
        const tl = Lines(root, { x: 90, y: 352, w: 900, cls: 'h-m', lines: f.title.map(t => ({ text: t })), maxSize: 96 });
        return { f, tl };
      });
      const tsize = Math.min(...blocks.map(bk => bk.tl.root.__size));
      blocks.forEach(bk => {
        bk.tl.root.style.fontSize = `${tsize}px`;
        const th = bk.tl.root.getBoundingClientRect().height;
        bk.desc = Words(root, { x: 90, y: 352 + th + 16, w: 900, text: bk.f.desc, style: { fontSize: '42px', lineHeight: '1.36', textWrap: 'balance' } });
        bk.bottom = 352 + th + 16 + bk.desc.root.getBoundingClientRect().height;
      });

      // F1 to F3: flipping chat card
      const flipWrap = h('div', { class: 'layer', style: { perspective: '2600px', perspectiveOrigin: '540px 1000px' } });
      root.appendChild(flipWrap);
      const CARD_Y = 668, CARD_H = 700;
      const flipper = h('div', { class: 'abs', style: { left: '90px', top: `${CARD_Y}px`, width: '900px', height: `${CARD_H}px`, transformStyle: 'preserve-3d', transformOrigin: '450px 300px' } });
      flipWrap.appendChild(flipper);
      const front = ChatCard(flipper, { x: 0, y: 0, w: 900, h: CARD_H, chip: 'EN' });
      const back = ChatCard(flipper, { x: 0, y: 0, w: 900, h: CARD_H, chip: 'AR' });
      css(front.root, { backfaceVisibility: 'hidden' });
      css(back.root, { backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' });
      const VIEW_H = 1244 - (CARD_Y + 138);
      front.setViewH(VIEW_H); back.setViewH(VIEW_H);

      const f1 = FT[0], f2 = FT[1], f3 = FT[2];
      front.msg({ side: 'in', text: 'Do you have a table for four\ntonight at 8?', meta: '9:41 PM', t: f1 + b(0.5) });
      front.msg({ side: 'out', text: 'Yes. 8:00 PM for four is free.\nShall I hold it under your name?', meta: 'Replied in 4 seconds', typing: [f1 + b(1.5), f1 + b(2.5)], t: f1 + b(2.5), metaT: f1 + b(3.1) });
      const bookingCheck = h('div', { style: { width: '62px', height: '62px', borderRadius: '50%', background: 'rgba(157,232,176,0.16)', border: '2px solid rgba(157,232,176,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' } });
      bookingCheck.innerHTML = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9de8b0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>';
      const bookingPath = bookingCheck.querySelector('path');
      const booking = h('div', { class: 'bubble', style: { background: 'linear-gradient(160deg,#2a1d45,#1e1530)', border: '2px solid rgba(157,232,176,0.55)', color: '#fff', padding: '26px 32px', borderRadius: '36px 36px 10px 36px', width: '600px', textAlign: 'left', boxShadow: '0 0 60px rgba(157,232,176,0.18)' } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '18px' } }, bookingCheck, h('span', { class: 'mono', style: { color: 'var(--mint)', fontWeight: '700', fontSize: '28px', letterSpacing: '0.16em' } }, 'BOOKED'), h('span', { style: { marginLeft: 'auto', color: 'var(--lav-2)', display: 'flex' } }, icon('calCheck', 44, 'currentColor', 2))),
        h('div', { style: { fontSize: '42px', fontWeight: '600', lineHeight: '1.2' } }, 'Table for four'),
        h('div', { style: { fontSize: '34px', color: 'var(--lav-2)', marginTop: '8px', fontWeight: '500' } }, 'Tonight, 8:00 PM'));
      const bookItem = front.msg({ side: 'out', node: booking, typing: [f3 + b(1.2), f3 + b(2.2)], t: f3 + b(2.2) });
      back.msg({ side: 'in', text: AR_Q, ar: true, meta: '11:12 PM', t: f2 + b(1.1) });
      back.msg({ side: 'out', text: AR_A, ar: true, meta: 'Replied in 3 seconds', typing: [f2 + b(2), f2 + b(3)], t: f2 + b(3), metaT: f2 + b(3.6) });
      front.layout(); back.layout();

      cue(b(28.2), 'whooshUp', 0.7);
      cue(f1 + b(0.5), 'pop', 0.8, -0.2); cue(f1 + b(1.5), 'typing', 0.5, 0.2); cue(f1 + b(2.5), 'popOut', 0.9, 0.2); cue(f1 + b(3.1), 'tick', 0.6, 0.2);
      cue(f2 - 0.1, 'flip', 1.0); cue(f2 + b(1.1), 'pop', 0.8, -0.2); cue(f2 + b(2), 'typing', 0.5, 0.2); cue(f2 + b(3), 'popOut', 0.9, 0.2); cue(f2 + b(3.6), 'tick', 0.6, 0.2);
      cue(f3 - 0.1, 'flip', 1.0); cue(f3 + b(1.2), 'typing', 0.5, 0.2); cue(f3 + b(2.2), 'success', 1.0, 0.15);

      // F4: integration graph
      const f4 = FT[3];
      const graph = h('div', { class: 'layer' });
      root.appendChild(graph);
      const HUB = { x: 540, y: 722 };
      const svg = s('svg', { width: 1080, height: 1920, viewBox: '0 0 1080 1920', style: 'position:absolute;left:0;top:0;overflow:visible' });
      graph.appendChild(svg);
      const nodesDef = [
        { label: 'Booking system', ic: 'calendar', x: 70 },
        { label: 'CRM', ic: 'users', x: 400 },
        { label: 'POS', ic: 'card', x: 730 },
      ];
      const NODE_Y = 906, NODE_W = 280, NODE_H = 206;
      const nodes = nodesDef.map((n, i) => {
        const el = h('div', { class: 'abs card', style: { left: `${n.x}px`, top: `${NODE_Y}px`, width: `${NODE_W}px`, height: `${NODE_H}px`, borderRadius: '34px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center', transformOrigin: '50% 0%' } },
          squareIcon(n.ic, 80, 42), h('div', { style: { fontSize: '36px', fontWeight: '600', lineHeight: '1.12', padding: '0 18px' } }, n.label),
          h('div', { class: 'abs', style: { right: '22px', top: '22px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--mint)', boxShadow: '0 0 16px rgba(157,232,176,0.9)' } }));
        graph.appendChild(el);
        const ex = n.x + NODE_W / 2, ey = NODE_Y;
        const d = `M ${HUB.x} ${HUB.y + 74} C ${HUB.x} ${HUB.y + 140}, ${ex} ${ey - 90}, ${ex} ${ey}`;
        const glow = s('path', { d, fill: 'none', stroke: 'rgba(178,146,249,0.25)', 'stroke-width': 10, 'stroke-linecap': 'round' });
        const path = s('path', { d, fill: 'none', stroke: '#b292f9', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
        svg.appendChild(glow); svg.appendChild(path);
        const len = path.getTotalLength();
        const dots = [0, 1, 2].map(() => { const c = s('circle', { r: 7, fill: '#e6def2' }); svg.appendChild(c); return c; });
        return { el, path, glow, len, dots, i };
      });
      const hub = h('div', { class: 'abs', style: { left: `${HUB.x - 74}px`, top: `${HUB.y - 74}px`, width: '148px', height: '148px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #d6c4ff, #b292f9 60%, #8f6ae8)', color: 'var(--ink)', fontWeight: '800', fontSize: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 14px rgba(178,146,249,0.12), 0 0 90px rgba(178,146,249,0.65)' } }, 'N');
      graph.appendChild(hub);
      const hubRings = [0, 1].map(() => { const r = h('div', { class: 'abs', style: { left: `${HUB.x}px`, top: `${HUB.y}px`, width: '0px', height: '0px', borderRadius: '50%', border: '2px solid rgba(201,175,255,0.6)' } }); graph.appendChild(r); return r; });
      const noSoft = h('div', { class: 'abs pill', style: { top: '1160px', left: '0', background: 'rgba(157,232,176,0.10)', borderColor: 'rgba(157,232,176,0.45)', color: 'var(--mint)', fontWeight: '600' } }, icon('check', 34, 'currentColor', 3), h('span', null, 'Your team learns no new software.'));
      graph.appendChild(noSoft);
      css(noSoft, { left: `${540 - noSoft.getBoundingClientRect().width / 2}px` });
      cue(f4 - 0.25, 'swoosh', 0.8); cue(f4 + 0.2, 'hubPop', 0.9);
      nodes.forEach((n, i) => { cue(f4 + 0.45 + i * 0.12, 'zip', 0.55, (i - 1) * 0.5); cue(f4 + 0.85 + i * 0.12, 'pop', 0.6, (i - 1) * 0.5); });
      cue(f4 + b(3.5), 'tick', 0.6);

      // F5: number stays yours
      const f5 = FT[4];
      const numCard = h('div', { class: 'abs card', style: { left: '90px', top: '712px', width: '900px', padding: '32px 34px 34px' } });
      root.appendChild(numCard);
      const slider = h('div', { class: 'abs', style: { left: '6px', top: '6px', width: 'calc(50% - 6px)', bottom: '6px', borderRadius: '999px', background: 'rgba(178,146,249,0.2)', border: '2px solid rgba(178,146,249,0.55)' } });
      const tabA = h('div', { style: { flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '31px', fontWeight: '600', position: 'relative' } }, 'Your number today');
      const tabB = h('div', { style: { flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '31px', fontWeight: '600', position: 'relative' } }, 'With Nosh');
      const toggle = h('div', { style: { position: 'relative', display: 'flex', height: '96px', borderRadius: '999px', background: 'rgba(255,255,255,0.03)', border: '2px solid var(--line)' } }, slider, tabA, tabB);
      const flag = h('div', { style: { width: '66px', height: '44px', borderRadius: '8px', flex: 'none', background: 'linear-gradient(to right, #ef3340 0 26%, transparent 26%), linear-gradient(to bottom, #00843d 0 33.4%, #ffffff 33.4% 66.6%, #111 66.6%)', boxShadow: '0 0 0 2px rgba(255,255,255,0.12)' } });
      const lockIc = h('div', { style: { marginLeft: 'auto', color: 'var(--lav-2)', display: 'flex' } }, icon('lock', 46, 'currentColor', 2.2));
      const numRow = h('div', { style: { display: 'flex', alignItems: 'center', gap: '24px', marginTop: '34px', padding: '26px 30px', borderRadius: '28px', background: 'rgba(18,12,25,0.6)', border: '2px solid var(--line)' } }, flag, h('div', { class: 'mono', style: { fontSize: '50px', fontWeight: '700', letterSpacing: '0.02em', whiteSpace: 'nowrap' } }, '+971 5X XXX XXXX'), lockIc);
      const stDot = h('div', { style: { width: '18px', height: '18px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 16px rgba(37,211,102,0.9)', flex: 'none' } });
      const status = h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', height: '0px', overflow: 'hidden', fontSize: '31px', fontWeight: '600', color: 'var(--mint)' } }, stDot, h('span', null, 'Replies instantly, 24/7, English and Arabic'));
      const ring = h('div', { style: { width: '62px', height: '62px', flex: 'none', position: 'relative' } });
      ring.innerHTML = '<svg width="62" height="62" viewBox="0 0 62 62"><circle cx="31" cy="31" r="26" fill="none" stroke="rgba(178,146,249,0.2)" stroke-width="5"/><circle class="arc" cx="31" cy="31" r="26" fill="none" stroke="#9de8b0" stroke-width="5" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 31 31)"/><path class="ck" d="M21 31.5l7 7 13-14" fill="none" stroke="#9de8b0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>';
      const arc = ring.querySelector('.arc'), ck = ring.querySelector('.ck');
      const setup = h('div', { style: { display: 'flex', alignItems: 'center', gap: '22px', marginTop: '28px', fontSize: '38px', fontWeight: '600' } }, ring, h('span', null, 'Setup handled by us'));
      numCard.append(toggle, numRow, status, setup);
      cue(f5 - 0.15, 'whooshUp', 0.7); cue(f5 + b(2), 'toggle', 1.0); cue(f5 + b(4.4), 'success', 0.9);

      // F6: team takeover
      const f6 = FT[5];
      const hoWrap = h('div', { class: 'layer', style: { perspective: '2200px', perspectiveOrigin: '540px 900px' } });
      root.appendChild(hoWrap);
      const ho = ChatCard(hoWrap, { x: 90, y: 700, w: 900, h: 600, status: 'AI agent', chip: 'AI' });
      ho.setViewH(1244 - (700 + 138));
      css(ho.root, { transformOrigin: '450px 0px' });
      const skel = (side, widths, mint) => {
        const bars = widths.map(w => h('div', { style: { width: `${w}px`, height: '20px', borderRadius: '10px', background: side === 'out' ? 'rgba(26,17,40,0.28)' : 'rgba(230,222,242,0.16)', margin: '10px 0' } }));
        return h('div', { class: 'bubble', style: mint ? { background: 'var(--mint)', borderColor: 'transparent' } : {} }, ...bars);
      };
      ho.msg({ side: 'in', node: skel('in', [430, 300]), t: f6 + 0.1 });
      ho.msg({ side: 'out', node: skel('out', [380, 240]), t: f6 + 0.3 });
      ho.system({ text: 'Picked up by a person', icon: 'user', t: f6 + b(2.3) });
      ho.msg({ side: 'out', node: skel('out', [340, 200], true), typing: [f6 + b(3.1), f6 + b(4)], t: f6 + b(4) });
      ho.layout();
      const personAv = h('div', { class: 'abs', style: { left: '0', top: '0', width: '100%', height: '100%', borderRadius: '50%', background: 'var(--mint)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: '0' } }, icon('user', 40, '#1a1128', 2.4));
      css(ho.avatarEl, { position: 'relative', overflow: 'hidden' });
      ho.avatarEl.appendChild(personAv);
      const teamStatus = h('span', { style: { position: 'absolute', left: '0', top: '0', opacity: '0', whiteSpace: 'nowrap' } }, 'Your team');
      css(ho.statusEl, { position: 'relative' });
      const aiStatus = h('span', null, 'AI agent');
      ho.statusEl.textContent = '';
      ho.statusEl.append(aiStatus, teamStatus);
      const teamChip = h('span', { style: { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: '0' } }, 'TEAM');
      css(ho.chipEl, { position: 'relative', minWidth: '150px', textAlign: 'center' });
      const aiChip = h('span', null, 'AI');
      ho.chipEl.textContent = '';
      ho.chipEl.append(aiChip, teamChip);
      cue(f6 - 0.2, 'flipDown', 0.8); cue(f6 + b(2), 'toggle', 1.0); cue(f6 + b(2.3), 'pop', 0.8); cue(f6 + b(4), 'popOut', 0.8, 0.2);

      // F7: kept up to date
      const f7 = FT[6];
      const upCard = h('div', { class: 'abs card', style: { left: '90px', top: '690px', width: '900px', padding: '14px 34px' } });
      root.appendChild(upCard);
      const rowsDef = [{ label: 'Services', ic: 'layers' }, { label: 'Hours', ic: 'clock' }, { label: 'Prices', ic: 'card' }];
      const rows = rowsDef.map((r, i) => {
        const spin = h('div', { style: { width: '40px', height: '40px', borderRadius: '50%', border: '5px solid rgba(178,146,249,0.25)', borderTopColor: 'var(--lav)', position: 'absolute', right: '0', top: '50%', marginTop: '-20px' } });
        const done = h('div', { style: { position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--mint)', fontWeight: '600', fontSize: '32px', opacity: '0', whiteSpace: 'nowrap' } }, icon('check', 36, 'currentColor', 3), 'Updated');
        const bar = h('div', { style: { position: 'absolute', right: '0', top: '50%', marginTop: '-9px', width: '150px', height: '18px', borderRadius: '9px', background: 'rgba(230,222,242,0.12)' } });
        const right = h('div', { style: { position: 'relative', marginLeft: 'auto', width: '230px', height: '60px' } }, bar, spin, done);
        const row = h('div', { style: { display: 'flex', alignItems: 'center', gap: '26px', padding: '26px 0', borderBottom: i < 2 ? '2px solid var(--line)' : 'none' } }, squareIcon(r.ic, 80, 40), h('div', { style: { fontSize: '44px', fontWeight: '600' } }, r.label), right);
        upCard.appendChild(row);
        return { row, spin, done, bar, tU: f7 + b(1.4 + i * 1.0) };
      });
      const support = h('div', { class: 'abs pill', style: { top: '1150px', left: '0', background: 'rgba(157,232,176,0.10)', borderColor: 'rgba(157,232,176,0.45)', color: 'var(--mint)', fontWeight: '600' } }, icon('headset', 36, 'currentColor', 2.4), h('span', null, 'Support included'));
      root.appendChild(support);
      css(support, { left: `${540 - support.getBoundingClientRect().width / 2}px` });
      cue(f7 - 0.25, 'whip', 0.9);
      rows.forEach(r => { cue(r.tU, 'blip', 0.5); cue(r.tU + b(0.9), 'check', 0.8); });
      cue(f7 + b(4.6), 'pop', 0.7);

      // feature change cues
      FT.slice(1, 7).forEach(t0 => cue(t0 - 0.08, 'tickBig', 0.6));

      return function update(t) {
        // header
        const hIn = E.outCubic(prog(t, FT[0] - 0.25, FT[0] + 0.3)), hOut = E.inCubic(prog(t, FT[7] - 0.35, FT[7]));
        css(hdr, { opacity: (hIn * (1 - hOut)).toFixed(3), transform: `translate3d(0,${((1 - hIn) * -20 - hOut * 20).toFixed(2)}px,0)` });
        let k = 0;
        for (let i = 1; i < 7; i++) k += E.snap(prog(t, FT[i] - 0.12, FT[i] + 0.25));
        css(digit, { transform: `translate3d(0,${(-k * 40).toFixed(2)}px,0)` });
        segs.forEach((f, i) => css(f, { width: `${(prog(t, FT[i], FT[i + 1]) * 100).toFixed(2)}%` }));

        // titles and descriptions
        blocks.forEach((bk, i) => {
          const tIn = FT[i] + 0.02, tOut = FT[i + 1] - 0.3;
          const on = t > tIn - 0.1 && t < tOut + 0.6;
          css(bk.tl.root, { visibility: on ? 'visible' : 'hidden' });
          css(bk.desc.root, { visibility: on ? 'visible' : 'hidden' });
          if (!on) return;
          lineAnim(bk.tl.items, t, tIn, tOut, { stagger: 0.08, dur: 0.7 });
          wordsAnim(bk.desc.words, t, tIn + 0.22, tOut + 0.05, { stagger: 0.028, dur: 0.5, durOut: 0.25 });
        });

        // chat flipper (F1 to F3), enters during the solution scene
        const peek = kf(t, [[b(28.2), 1320], [b(28.2) + 1.1, 560, E.outExpo], [b(31.1), 560], [b(32) + 0.1, 0, E.snap]]);
        const tilt = kf(t, [[b(28.2), 34], [b(28.2) + 1.1, 16, E.outCubic], [b(31.1), 16], [b(32) + 0.1, 0, E.snap]]);
        const flip = E.inOutCubic(prog(t, f2 - 0.12, f2 + 0.62)) * 180 + E.inOutCubic(prog(t, f3 - 0.12, f3 + 0.62)) * 180;
        const dip = Math.sin(prog(t, f2 - 0.12, f2 + 0.62) * Math.PI) + Math.sin(prog(t, f3 - 0.12, f3 + 0.62) * Math.PI);
        const toHub = E.inOutCubic(prog(t, f4 - 0.3, f4 + 0.28));
        const fx = lerp(0, HUB.x - 540, toHub), fy = lerp(0, HUB.y - (CARD_Y + CARD_H * 0.43), toHub);
        const fs = lerp(1 - dip * 0.07, 0.08, toHub);
        css(flipper, {
          transform: `translate3d(${fx.toFixed(2)}px,${(fy + peek).toFixed(2)}px,0) rotateX(${tilt.toFixed(2)}deg) rotateY(${flip.toFixed(2)}deg) scale(${fs.toFixed(4)})`,
          opacity: (1 - E.inQuad(prog(t, f4 - 0.05, f4 + 0.28))).toFixed(3),
          visibility: t < f4 + 0.3 ? 'visible' : 'hidden',
        });
        if (t < f4 + 0.3) {
          front.update(t); back.update(t);
          const ck2 = E.outCubic(prog(t, bookItem.t + 0.25, bookItem.t + 0.7));
          bookingPath.setAttribute('stroke-dashoffset', (1 - ck2).toFixed(3));
          css(booking, { boxShadow: `0 0 ${(90 * (1 - tw(t, bookItem.t, bookItem.t + 1.2)) + 30).toFixed(1)}px rgba(157,232,176,${(0.35 * (1 - tw(t, bookItem.t, bookItem.t + 1.2)) + 0.12).toFixed(3)})` });
        }

        // graph (F4)
        const gOn = t > f4 - 0.4 && t < FT[4] + 0.6;
        css(graph, { visibility: gOn ? 'visible' : 'hidden' });
        if (gOn) {
          const gOut = E.inCubic(prog(t, FT[4] - 0.35, FT[4] + 0.1));
          const hp = E.spring(prog(t, f4 + 0.15, f4 + 1.0), 0.45, 2.2);
          css(hub, { transform: `scale(${(hp * (1 - gOut)).toFixed(4)})`, opacity: clamp(hp * 3).toFixed(3) });
          hubRings.forEach((r, i) => {
            const ph = ((t - f4 - 0.4 - i * 0.6) % 1.2 + 1.2) % 1.2 / 1.2;
            const on = t > f4 + 0.4 + i * 0.6;
            const rad = 74 + ph * 120;
            css(r, { width: `${2 * rad}px`, height: `${2 * rad}px`, marginLeft: `${-rad}px`, marginTop: `${-rad}px`, opacity: on ? ((1 - ph) * 0.6 * (1 - gOut)).toFixed(3) : '0' });
          });
          nodes.forEach((n, i) => {
            const d0 = f4 + 0.45 + i * 0.12;
            const draw = E.inOutCubic(prog(t, d0, d0 + 0.45));
            n.path.setAttribute('stroke-dasharray', `${(n.len * draw).toFixed(1)} ${n.len}`);
            n.glow.setAttribute('stroke-dasharray', `${(n.len * draw).toFixed(1)} ${n.len}`);
            const np = E.spring(prog(t, d0 + 0.38, d0 + 1.1), 0.5, 2);
            css(n.el, { opacity: (clamp(np * 2) * (1 - gOut)).toFixed(3), transform: `translate3d(0,${((1 - np) * 40 - gOut * 60).toFixed(2)}px,0) scale(${(0.8 + 0.2 * np).toFixed(4)})` });
            n.path.setAttribute('opacity', (1 - gOut).toFixed(3)); n.glow.setAttribute('opacity', (1 - gOut).toFixed(3));
            n.dots.forEach((c, j) => {
              const live = t > d0 + 0.5;
              const ph = ((t - d0 - 0.5) * 0.9 + j / 3 + i * 0.13) % 1;
              const dir = (i + j) % 2 === 0 ? ph : 1 - ph;
              const p = n.path.getPointAtLength(n.len * dir);
              c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1));
              c.setAttribute('opacity', live ? (Math.sin(ph * Math.PI) * (1 - gOut)).toFixed(3) : '0');
            });
          });
          const ns = E.outBack(prog(t, f4 + b(3.5), f4 + b(3.5) + 0.5));
          css(noSoft, { opacity: (clamp(ns) * (1 - gOut)).toFixed(3), transform: `translate3d(0,${((1 - clamp(ns)) * 30).toFixed(2)}px,0) scale(${(0.9 + 0.1 * ns).toFixed(4)})` });
        }

        // number card (F5)
        const nOn = t > f5 - 0.4 && t < FT[5] + 0.7;
        css(numCard, { visibility: nOn ? 'visible' : 'hidden' });
        if (nOn) {
          const a = E.spring(prog(t, f5 - 0.15, f5 + 0.9), 0.6, 1.6);
          const out = E.inOutCubic(prog(t, FT[5] - 0.35, FT[5] + 0.3));
          css(numCard, { opacity: (clamp(a * 2) * (1 - out)).toFixed(3), transform: `perspective(2200px) translate3d(0,${((1 - a) * 260 + out * 120).toFixed(2)}px,0) rotateX(${(out * -70).toFixed(2)}deg)`, transformOrigin: '50% 100%' });
          const sw = E.spring(prog(t, f5 + b(2), f5 + b(2) + 0.7), 0.55, 2.2);
          css(slider, { transform: `translate3d(${(sw * 100).toFixed(2)}%,0,0)` });
          css(tabA, { color: sw > 0.5 ? 'var(--muted-2)' : '#fff' });
          css(tabB, { color: sw > 0.5 ? '#fff' : 'var(--muted-2)' });
          const st = E.outCubic(prog(t, f5 + b(2.3), f5 + b(2.3) + 0.4));
          css(status, { height: `${(st * 44).toFixed(2)}px`, marginTop: `${(st * 26).toFixed(2)}px`, opacity: st.toFixed(3) });
          css(numRow, { borderColor: `rgba(157,232,176,${(0.16 + 0.4 * (1 - tw(t, f5 + b(2), f5 + b(2) + 1.2)) * (t > f5 + b(2) ? 1 : 0)).toFixed(3)})` });
          const lockPulse = t > f5 + b(2) ? Math.sin(prog(t, f5 + b(2), f5 + b(2) + 0.5) * Math.PI) : 0;
          css(lockIc, { transform: `scale(${(1 + lockPulse * 0.25).toFixed(3)})`, color: lockPulse > 0.05 || t > f5 + b(2.5) ? 'var(--mint)' : 'var(--lav-2)' });
          const rg = E.inOutCubic(prog(t, f5 + b(3), f5 + b(4.4)));
          arc.setAttribute('stroke-dashoffset', (1 - rg).toFixed(3));
          ck.setAttribute('stroke-dashoffset', (1 - E.outCubic(prog(t, f5 + b(4.4), f5 + b(4.4) + 0.35))).toFixed(3));
        }

        // handover card (F6)
        const hOn = t > f6 - 0.4 && t < FT[6] + 0.7;
        css(hoWrap, { visibility: hOn ? 'visible' : 'hidden' });
        if (hOn) {
          const a = E.spring(prog(t, f6 - 0.2, f6 + 0.9), 0.6, 1.5);
          const out = E.whip(prog(t, FT[6] - 0.3, FT[6] + 0.25));
          css(ho.root, { opacity: (clamp(a * 2)).toFixed(3), transform: `translate3d(${(-out * 1150).toFixed(2)}px,0,0) rotateX(${((1 - a) * 80).toFixed(2)}deg)`, filter: out > 0.02 && out < 0.98 ? `blur(${(Math.sin(out * Math.PI) * 14).toFixed(2)}px)` : 'none' });
          ho.update(t);
          const sw = E.outCubic(prog(t, f6 + b(2), f6 + b(2) + 0.35));
          css(personAv, { opacity: sw.toFixed(3), transform: `scale(${(0.6 + 0.4 * E.outBack(prog(t, f6 + b(2), f6 + b(2) + 0.4))).toFixed(3)})` });
          css(aiStatus, { opacity: (1 - sw).toFixed(3) });
          css(teamStatus, { opacity: sw.toFixed(3) });
          css(aiChip, { opacity: (1 - sw).toFixed(3) });
          css(teamChip, { opacity: sw.toFixed(3) });
          css(ho.chipEl, { background: sw > 0.5 ? 'rgba(157,232,176,0.16)' : 'rgba(178,146,249,0.12)', borderColor: sw > 0.5 ? 'rgba(157,232,176,0.6)' : 'var(--line-2)', color: sw > 0.5 ? 'var(--mint)' : 'var(--lav-2)' });
        }

        // updates card (F7)
        const uOn = t > f7 - 0.4 && t < FT[7] + 0.6;
        css(upCard, { visibility: uOn ? 'visible' : 'hidden' });
        css(support, { visibility: uOn ? 'visible' : 'hidden' });
        if (uOn) {
          const a = E.whip(prog(t, f7 - 0.3, f7 + 0.25));
          const out = E.inCubic(prog(t, FT[7] - 0.35, FT[7] + 0.1));
          css(upCard, { opacity: (1 - out).toFixed(3), transform: `translate3d(${((1 - a) * 1150).toFixed(2)}px,${(-out * 60).toFixed(2)}px,0) scale(${(1 - out * 0.1).toFixed(4)})`, filter: a > 0.02 && a < 0.98 ? `blur(${(Math.sin(a * Math.PI) * 14).toFixed(2)}px)` : 'none' });
          rows.forEach(r => {
            const busy = t > r.tU && t < r.tU + b(0.9);
            const ok = E.outBack(prog(t, r.tU + b(0.9), r.tU + b(0.9) + 0.4));
            css(r.spin, { opacity: busy ? '1' : '0', transform: `rotate(${((t - r.tU) * 720).toFixed(1)}deg)` });
            css(r.bar, { opacity: t < r.tU ? '1' : '0' });
            css(r.done, { opacity: clamp(ok).toFixed(3), transform: `translateY(-50%) scale(${(0.7 + 0.3 * ok).toFixed(3)})` });
            css(r.row, { background: `linear-gradient(90deg, rgba(157,232,176,${(0.08 * (1 - tw(t, r.tU + b(0.9), r.tU + b(0.9) + 1))) * (t > r.tU + b(0.9) ? 1 : 0)}) , rgba(0,0,0,0))` });
          });
          const sp = E.outBack(prog(t, f7 + b(4.6), f7 + b(4.6) + 0.5));
          css(support, { opacity: (clamp(sp) * (1 - out)).toFixed(3), transform: `translate3d(0,${((1 - clamp(sp)) * 30).toFixed(2)}px,0) scale(${(0.9 + 0.1 * sp).toFixed(4)})` });
        }
      };
    },
  });
})();
