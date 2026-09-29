/* Timeline core: beat grid, scene registry, camera, global FX, SFX cues. */
(function (g) {
  'use strict';
  const { h, css, kf, E, prog, clamp, drift } = L;

  const BPM = 117;
  const BEAT = 60 / BPM;
  g.BPM = BPM;
  g.BEAT = BEAT;
  g.b = n => n * BEAT;
  g.DUR = 60;

  const scenes = [];
  g.CUES = [];
  g.cue = (t, id, gain = 1, pan = 0) => { g.CUES.push({ t: Math.round(t * 1000) / 1000, id, gain, pan }); };
  g.scene = def => scenes.push(def);

  let stage, world, flash, ring, grainEl, vignetteEl;
  const b = g.b;

  // Camera: slow handheld float plus punches on the big hits.
  function camera(t) {
    const fl = 1;
    let x = drift(t, 0.21, 3) * 7 * fl, y = drift(t, 0.17, 4) * 9 * fl;
    let r = drift(t, 0.13, 5) * 0.28 * fl;
    let s = 1 + drift(t, 0.09, 6) * 0.006;
    const punch = (t0, amt, dur = 0.9) => { const p = prog(t, t0, t0 + dur); return t >= t0 ? amt * Math.pow(1 - p, 3) : 0; };
    s += punch(b(4), 0.035) + punch(b(24), 0.07, 1.4) + punch(b(56), 0.02) + punch(b(88), 0.025) + punch(b(108), 0.03, 1.2);
    // micro shake on impacts
    const shake = (t0, amt, dur = 0.35) => { const p = prog(t, t0, t0 + dur); return t >= t0 && p < 1 ? amt * (1 - p) : 0; };
    const sh = shake(b(4), 9) + shake(b(24), 16, 0.5);
    x += Math.sin(t * 91) * sh; y += Math.cos(t * 77) * sh;
    return { x, y, r, s, starY: t * 4 };
  }

  function flashLevel(t) {
    const f = (t0, a, up = 0.03, down = 0.45) => (t < t0 - up ? 0 : t < t0 ? a * prog(t, t0 - up, t0) : a * Math.pow(1 - prog(t, t0, t0 + down), 2));
    return Math.min(1, f(b(4), 0.2, 0.02, 0.45) + f(b(24), 0.62, 0.04, 0.6) + f(b(108), 0.22, 0.04, 0.7));
  }

  async function init() {
    const faces = ['300', '400', '500', '600', '700', '800'].map(w => `${w} 40px Poppins`)
      .concat(['400 40px "Space Mono"', '700 40px "Space Mono"', '400 40px "IBM Plex Sans Arabic"', '500 40px "IBM Plex Sans Arabic"', '600 40px "IBM Plex Sans Arabic"']);
    await Promise.all(faces.map(f => document.fonts.load(f, 'Aa0 كم')));
    await document.fonts.ready;

    stage = document.getElementById('stage');
    const bgLayers = BG.build(stage);
    grainEl = bgLayers.grainEl;
    vignetteEl = bgLayers.vignetteEl;
    world = h('div', { class: 'layer', id: 'world', style: { transformOrigin: '540px 900px' } });
    stage.appendChild(world);
    for (const s of scenes) {
      s.root = h('div', { class: 'scene', 'data-scene': s.name });
      world.appendChild(s.root);
      s.update = s.build(s.root);
      s.active = true;
    }
    ring = h('div', { class: 'abs', style: { left: '540px', top: '900px', width: '10px', height: '10px', marginLeft: '-5px', marginTop: '-5px', borderRadius: '50%', border: '3px solid rgba(201,175,255,0.9)', opacity: '0' } });
    flash = h('div', { class: 'layer', style: { background: 'radial-gradient(circle at 50% 47%, #ffffff 0%, #e6d9ff 35%, rgba(178,146,249,0.55) 70%, rgba(178,146,249,0.2) 100%)', opacity: '0', mixBlendMode: 'screen' } });
    stage.appendChild(ring);
    stage.appendChild(flash);
    stage.appendChild(vignetteEl);
    stage.appendChild(grainEl);
    g.__ready = true;
  }

  g.renderFrame = function (t, frame = Math.round(t * 30)) {
    const cam = camera(t);
    BG.draw(t, cam);
    css(world, { transform: `translate3d(${cam.x.toFixed(2)}px,${cam.y.toFixed(2)}px,0) rotate(${cam.r.toFixed(3)}deg) scale(${cam.s.toFixed(4)})` });
    for (const s of scenes) {
      const on = t >= s.t0 && t < s.t1;
      if (on !== s.active) { s.root.style.display = on ? '' : 'none'; s.active = on; }
      if (on) s.update(t);
    }
    css(flash, { opacity: flashLevel(t).toFixed(3) });
    // shock rings on the two big hits
    const ringAt = [b(4), b(24)].filter(t0 => t >= t0 && t < t0 + 1.2).pop();
    if (ringAt != null) {
      const p = prog(t, ringAt, ringAt + 1.1);
      const big = ringAt === b(24);
      const r = 5 + E.outCubic(p) * (big ? 1300 : 800);
      css(ring, { opacity: ((1 - p) * (big ? 0.9 : 0.5)).toFixed(3), width: `${(2 * r).toFixed(1)}px`, height: `${(2 * r).toFixed(1)}px`, marginLeft: `${(-r).toFixed(1)}px`, marginTop: `${(-r).toFixed(1)}px`, borderWidth: `${(big ? 6 : 3) * (1 - p) + 0.5}px`, top: big ? '900px' : '640px' });
    } else css(ring, { opacity: '0' });
    BG.grain(frame);
  };

  g.initShowreel = init;
})(window);
