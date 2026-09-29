/* Reusable UI and type components in the Nosh landing page style. */
(function (g) {
  'use strict';
  const { h, css, tf, E, prog, clamp, lerp, tw, env, splitWords } = L;

  // Headline built from masked lines. Returns items for line reveals.
  function Lines(parent, { x, y, w, lines, cls = 'h-l', align = 'left', maxSize, minSize = 40, lineGap = 0, fitAll = true }) {
    const root = h('div', { class: `abs ${cls}`, style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, textAlign: align } });
    parent.appendChild(root);
    const items = lines.map(l => {
      const inner = h('span', { class: `in ${l.cls || ''}` }, l.text);
      const wrap = h('span', { class: 'line', style: { marginBottom: `${lineGap}px` } }, inner);
      root.appendChild(wrap);
      return { wrap, inner, text: l.text };
    });
    if (maxSize) {
      let size = maxSize;
      root.style.fontSize = `${size}px`;
      const tooWide = () => items.some(it => it.inner.getBoundingClientRect().width > w + 1);
      while (size > minSize && tooWide()) { size -= 2; root.style.fontSize = `${size}px`; }
      root.__size = size;
    }
    return { root, items, get height() { return root.getBoundingClientRect().height; } };
  }

  // Masked line reveal and exit.
  function lineAnim(items, t, tIn, tOut, o = {}) {
    const st = o.stagger ?? 0.07, dIn = o.dur ?? 0.75, dOut = o.durOut ?? 0.45;
    const eIn = o.ease || E.outExpo, eOut = o.easeOut || E.inCubic;
    const rot = o.rot ?? 4;
    items.forEach((it, i) => {
      const a = eIn(prog(t, tIn + i * st, tIn + i * st + dIn));
      const b = tOut == null ? 0 : eOut(prog(t, tOut + i * (o.staggerOut ?? 0.04), tOut + i * (o.staggerOut ?? 0.04) + dOut));
      const y = (1 - a) * 115 - b * 115;
      const r = (1 - a) * rot - b * rot * 0.5;
      css(it.inner, { transform: `translate3d(0,${y.toFixed(2)}%,0) rotate(${r.toFixed(2)}deg)`, transformOrigin: '0% 100%', opacity: a > 0 ? '1' : '0' });
    });
  }

  // Word by word blur reveal (for sublines).
  function Words(parent, { x, y, w, text, cls = 'sub', align = 'left', style }) {
    const root = h('div', { class: `abs ${cls}`, style: Object.assign({ left: `${x}px`, top: `${y}px`, width: `${w}px`, textAlign: align }, style || {}) });
    parent.appendChild(root);
    const words = splitWords(root, text);
    return { root, words };
  }
  function wordsAnim(words, t, tIn, tOut, o = {}) {
    const st = o.stagger ?? 0.035, d = o.dur ?? 0.55, blur = o.blur ?? 10, dy = o.dy ?? 26;
    words.forEach((wd, i) => {
      const a = E.outCubic(prog(t, tIn + i * st, tIn + i * st + d));
      const b = tOut == null ? 0 : E.inCubic(prog(t, tOut + i * 0.012, tOut + i * 0.012 + (o.durOut ?? 0.35)));
      const v = a * (1 - b);
      css(wd, {
        opacity: v.toFixed(3),
        transform: `translate3d(0,${((1 - a) * dy - b * dy * 0.6).toFixed(2)}px,0)`,
        filter: v > 0.995 ? 'none' : `blur(${((1 - v) * blur).toFixed(2)}px)`,
      });
    });
  }

  // Typewriter for mono eyebrows.
  function typeText(el, full, t, tIn, cps = 38, tOut, cpsOut = 80) {
    let n = Math.floor(clamp((t - tIn) * cps, 0, full.length));
    if (tOut != null && t > tOut) n = Math.max(0, full.length - Math.floor((t - tOut) * cpsOut));
    const cursor = n < full.length && t > tIn && (tOut == null || t < tOut) ? '█' : '';
    const txt = full.slice(0, n);
    if (el.__t !== txt + cursor) { el.textContent = txt; if (cursor) el.appendChild(h('span', { style: { opacity: '0.7', marginLeft: '4px', fontSize: '0.8em' } }, cursor)); el.__t = txt + cursor; }
  }

  function Pill(parent, { x, y, text, dot = true }) {
    const el = h('div', { class: 'abs pill', style: { left: `${x}px`, top: `${y}px` } }, dot ? h('span', { class: 'dot' }) : null, h('span', null, text));
    parent.appendChild(el);
    return el;
  }

  function Wordmark(parent, { x, y, size = 64, align = 'left', color = '#fff' }) {
    const el = h('div', { class: 'abs wm', style: { left: `${x}px`, top: `${y}px`, textAlign: align, color, lineHeight: '1' } },
      h('div', { style: { fontWeight: '700', fontSize: `${size}px`, letterSpacing: '0.01em', whiteSpace: 'nowrap' } }, 'NOSH ', h('span', { style: { color: 'var(--lav)' } }, 'AI')),
      h('div', { style: { fontWeight: '600', fontSize: `${size * 0.27}px`, letterSpacing: '0.62em', marginTop: `${size * 0.16}px`, color: 'var(--lav-2)', whiteSpace: 'nowrap', paddingLeft: '0.1em' } }, 'AUTOMATION'),
    );
    parent.appendChild(el);
    return el;
  }

  // Rolling digit counter.
  function Odometer(parent, { digits = 2, size = 220, color = 'var(--amber)', prefix = '', suffix = '', family = "'Space Mono', monospace", weight = 700, lh = 1.0, x = 0, y = 0 }) {
    const root = h('div', { class: 'abs', style: { left: `${x}px`, top: `${y}px`, display: 'flex', alignItems: 'flex-start', fontFamily: family, fontWeight: weight, fontSize: `${size}px`, color, lineHeight: `${lh}`, letterSpacing: '-0.04em' } });
    const pre = prefix ? h('span', { style: { display: 'inline-block' } }, prefix) : null;
    if (pre) root.appendChild(pre);
    const cols = [];
    for (let i = 0; i < digits; i++) {
      const strip = h('div', { style: { display: 'flex', flexDirection: 'column', willChange: 'transform' } });
      for (let d = 0; d <= 10; d++) strip.appendChild(h('span', { style: { display: 'block', height: `${lh}em` } }, String(d % 10)));
      const col = h('div', { style: { height: `${lh}em`, overflow: 'hidden', position: 'relative' } }, strip);
      root.appendChild(col);
      cols.push({ col, strip });
    }
    const suf = suffix ? h('span', { style: { display: 'inline-block' } }, suffix) : null;
    if (suf) root.appendChild(suf);
    parent.appendChild(root);
    function set(v) {
      v = Math.max(0, v);
      const ones = v % 10;
      const carry = Math.max(0, ones - 9);
      const posOnes = ones;
      const tensN = Math.floor(v / 10) % 10;
      const posTens = tensN + carry;
      const pos = digits === 2 ? [posTens, posOnes] : [posOnes];
      cols.forEach((c, i) => css(c.strip, { transform: `translate3d(0,${(-pos[i] * lh * size).toFixed(2)}px,0)` }));
      if (digits === 2) css(cols[0].col, { opacity: clamp((v - 8.5) / 1.2, 0, 1).toFixed(3), width: v < 8.5 ? '0px' : '' });
    }
    return { root, set, pre, suf };
  }

  // Notification card (lock screen style).
  function Notification(parent, { x, y, w = 900, text, ar = false, app = 'WHATSAPP', time = 'now', replied }) {
    const icon = h('div', { style: { width: '76px', height: '76px', borderRadius: '20px', background: 'linear-gradient(160deg,#3ae07a,#1fb457)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(37,211,102,0.35)', flex: 'none' } }, L.icon('message', 44, '#fff', 2.4));
    const rep = h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--mint)', fontWeight: '600', fontSize: '28px', height: '0px', overflow: 'hidden', opacity: '0' } }, L.icon('checks', 34, 'currentColor', 2.6), h('span', null, replied || ''));
    const msg = h('div', { class: ar ? 'ar' : '', style: { fontWeight: '500', fontSize: ar ? '38px' : '34px', lineHeight: '1.36', color: 'rgba(255,255,255,0.94)', textAlign: ar ? 'right' : 'left', textWrap: 'balance' } }, text);
    const body = h('div', { style: { flex: '1', minWidth: '0' } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '600', fontSize: '25px', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.58)', marginBottom: '8px' } }, h('span', null, app), h('span', { style: { letterSpacing: '0.02em', fontWeight: '500' } }, time)),
      msg, rep);
    const el = h('div', { class: 'abs', style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, display: 'flex', gap: '26px', alignItems: 'flex-start', padding: '26px 32px', borderRadius: '46px', background: 'linear-gradient(180deg, rgba(47,35,72,0.95), rgba(33,24,52,0.95))', border: '2px solid rgba(255,255,255,0.11)', boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.10) inset', transformOrigin: '50% 100%' } }, icon, body);
    parent.appendChild(el);
    return { el, rep, msg };
  }

  // Chat card mirroring the landing page widget.
  function ChatCard(parent, { x, y, w = 900, h: height = 700, title = 'Business WhatsApp', status = 'Replies instantly, 24/7, English and Arabic', avatar = 'N', padTop = 30, padBottom = 30, gap = 22, headH = 136, chip = null }) {
    const avatarEl = h('div', { class: 'avatar' }, avatar);
    const titleEl = h('div', { class: 'chat-title' }, title);
    const statusEl = h('div', { class: 'chat-status' }, status);
    const chipEl = chip ? h('div', { class: 'mono', style: { marginLeft: 'auto', padding: '10px 22px', borderRadius: '999px', border: '2px solid var(--line-2)', background: 'rgba(178,146,249,0.12)', color: 'var(--lav-2)', fontWeight: '700', fontSize: '28px', letterSpacing: '0.12em' } }, chip) : null;
    const head = h('div', { class: 'chat-head', style: { height: `${headH}px` } }, avatarEl, h('div', { style: { minWidth: '0' } }, titleEl, statusEl), chipEl);
    const list = h('div', { class: 'chat-list' });
    const view = h('div', { class: 'chat-view', style: { top: `${headH + 2}px` } }, list);
    const root = h('div', { class: 'chat', style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${height}px` } }, head, view);
    parent.appendChild(root);
    const items = [];
    let viewH = height - headH - 2;

    function msg(o) {
      const bubble = o.node || h('div', { class: `bubble ${o.ar ? 'ar-b' : ''}` }, o.text);
      const meta = o.meta ? h('div', { class: 'meta' }, o.meta) : null;
      const el = h('div', { class: `msg ${o.side}` }, bubble, meta);
      list.appendChild(el);
      let tyEl = null;
      if (o.typing) {
        tyEl = h('div', { class: `msg ${o.side}` }, h('div', { class: 'typing' }, h('i'), h('i'), h('i')));
        list.appendChild(tyEl);
      }
      const it = Object.assign({}, o, { el, bubble, meta, tyEl, dots: tyEl ? [...tyEl.querySelectorAll('i')] : [] });
      items.push(it);
      return it;
    }
    function system(o) {
      const el = h('div', { class: 'msg', style: { textAlign: 'center' } }, h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '14px', padding: '16px 30px', borderRadius: '999px', background: 'rgba(157,232,176,0.12)', border: '2px solid rgba(157,232,176,0.35)', color: 'var(--mint)', fontSize: '30px', fontWeight: '600' } }, o.icon ? L.icon(o.icon, 34, 'currentColor', 2.4) : null, o.text));
      list.appendChild(el);
      const it = Object.assign({ el, side: 'sys' }, o);
      items.push(it);
      return it;
    }
    function layout() {
      let y0 = padTop;
      for (const it of items) {
        it.h = it.el.getBoundingClientRect().height;
        it.y = y0;
        css(it.el, { top: `${y0}px` });
        if (it.tyEl) { it.th = it.tyEl.getBoundingClientRect().height; css(it.tyEl, { top: `${y0}px` }); }
        y0 += it.h + gap;
      }
    }
    const popDur = 0.42;
    function update(t) {
      let bottom = 0;
      for (const it of items) {
        const a = E.outCubic(prog(t, it.t, it.t + popDur));
        const pop = E.springPop(prog(t, it.t, it.t + 0.75));
        const hide = it.hideAt != null ? E.inCubic(prog(t, it.hideAt, it.hideAt + 0.3)) : 0;
        const vis = a * (1 - hide);
        const origin = it.side === 'out' ? '100% 100%' : it.side === 'sys' ? '50% 50%' : '0% 100%';
        css(it.el, { opacity: vis.toFixed(3), transform: `translate3d(0,${((1 - a) * 30).toFixed(2)}px,0) scale(${(0.72 + 0.28 * pop).toFixed(4)})`, transformOrigin: origin, visibility: vis > 0.001 ? 'visible' : 'hidden' });
        if (it.meta) {
          const m = E.outCubic(prog(t, (it.metaT ?? it.t + 0.3), (it.metaT ?? it.t + 0.3) + 0.4));
          css(it.meta, { opacity: m.toFixed(3), transform: `translate3d(0,${((1 - m) * 12).toFixed(2)}px,0)` });
        }
        if (it.tyEl) {
          const [t0, t1] = it.typing;
          const ta = E.outBack(prog(t, t0, t0 + 0.3)) * (1 - E.inCubic(prog(t, t1 - 0.05, t1 + 0.12)));
          css(it.tyEl, { opacity: clamp(ta).toFixed(3), transform: `scale(${(0.6 + 0.4 * clamp(ta, 0, 1.2)).toFixed(4)})`, transformOrigin: it.side === 'out' ? '100% 100%' : '0% 100%', visibility: ta > 0.001 ? 'visible' : 'hidden' });
          it.dots.forEach((d, k) => {
            const ph = (t * 3.2 - k * 0.18) % 1;
            const up = Math.max(0, Math.sin(ph * Math.PI * 2)) * 10;
            css(d, { transform: `translate3d(0,${(-up).toFixed(2)}px,0)`, opacity: (0.45 + up / 18).toFixed(3) });
          });
          if (ta > 0.001) bottom = Math.max(bottom, it.y + it.th * clamp(ta));
        }
        if (vis > 0.001) bottom = Math.max(bottom, it.y + it.h * a);
      }
      const scroll = Math.max(0, bottom + padBottom - viewH);
      css(list, { transform: `translate3d(0,${(-scroll).toFixed(2)}px,0)` });
    }
    return { root, head, avatarEl, titleEl, statusEl, chipEl, view, list, msg, system, layout, update, items, setViewH: v => { viewH = v; } };
  }

  // Check list row with a drawn check mark.
  function CheckRow(parent, { x, y, w, text, size = 44 }) {
    const box = h('div', { style: { width: `${size * 1.45}px`, height: `${size * 1.45}px`, borderRadius: '50%', background: 'rgba(157,232,176,0.14)', border: '2px solid rgba(157,232,176,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', marginTop: `${size * 0.02}px` } });
    box.innerHTML = `<svg width="${size * 0.9}" height="${size * 0.9}" viewBox="0 0 24 24" fill="none" stroke="#9de8b0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`;
    const path = box.querySelector('path');
    const label = h('div', { style: { fontSize: `${size}px`, fontWeight: '500', lineHeight: '1.3', color: 'var(--lav-3)' } }, text);
    const el = h('div', { class: 'abs', style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, display: 'flex', gap: `${size * 0.6}px`, alignItems: 'flex-start' } }, box, label);
    parent.appendChild(el);
    return { el, box, path, label };
  }

  g.C = { Lines, lineAnim, Words, wordsAnim, typeText, Pill, Wordmark, Odometer, Notification, ChatCard, CheckRow };
})(window);
