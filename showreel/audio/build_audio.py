"""Score and sound design for the Nosh reel.

Music: "Fireworks" by Alexander Nakarada, released to the public domain (CC0) via FreePD.
The edit is beat locked: the track's drop lands on the "One WhatsApp." reveal (beat 24, 117 BPM).
Every sound effect is synthesised here from scratch and placed from cues.json, which the
animation timeline exports, so picture and sound share one clock.

Usage: python audio/build_audio.py [--out audio/mix.wav]
"""
import json
import os
import subprocess
import sys

import numpy as np
import pedalboard as pb
import pyloudnorm as pyln
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
DUR = 60.0
N = int(SR * DUR)
BPM = 117
BEAT = 60 / BPM
b = lambda n: n * BEAT  # noqa: E731

MUSIC = os.path.join(HERE, 'music', 'Alexander Nakarada - Fireworks (FreePD CC0).mp3')
DROP_IN_TRACK = 51.376          # measured onset of the drop in the track
DROP_IN_VIDEO = b(24)           # "One WhatsApp." reveal
OFFSET = DROP_IN_TRACK - DROP_IN_VIDEO
HIT = b(4)                      # "Your business doesn't."
END_HIT = b(108)                # end card
rng = np.random.default_rng(117)


# ---------- helpers ----------
def load_audio(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()


def secs(x):
    return int(round(x * SR))


def tt(d):
    return np.arange(secs(d)) / SR


def expdec(d, tau, attack=0.002):
    t = tt(d)
    env = np.exp(-t / tau)
    a = secs(attack)
    if a > 0:
        env[:a] *= np.linspace(0, 1, a)
    return env


def chirp(f0, f1, d, kind='exp'):
    t = tt(d)
    if kind == 'exp':
        f = f0 * (f1 / f0) ** (t / d)
    else:
        f = f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR), f


def sos(kind, f, order=2):
    if kind == 'bp':
        return signal.butter(order, [f[0] / (SR / 2), f[1] / (SR / 2)], btype='band', output='sos')
    return signal.butter(order, f / (SR / 2), btype=kind, output='sos')


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x, axis=0)


def stereo(x, pan=0.0, width=0.0):
    """Equal power pan. width decorrelates with a short delay."""
    ang = (pan + 1) * np.pi / 4
    l, r = x * np.cos(ang), x * np.sin(ang)
    if width > 0:
        d = secs(0.011 * width)
        r = np.concatenate([np.zeros(d), r])[: len(x)]
    return np.stack([l, r], axis=1)


def moving_band_noise(d, fc_curve, q=1.2, seed=0):
    """Noise through a time varying band pass, done in the STFT domain for smooth sweeps."""
    g = np.random.default_rng(seed)
    n = secs(d)
    x = g.standard_normal(n + 4096)
    f, t, Z = signal.stft(x, fs=SR, nperseg=1024, noverlap=768)
    tn = np.clip(t / d, 0, 1)
    fc = np.array([fc_curve(v) for v in tn])
    bw = fc / q
    mask = np.exp(-0.5 * ((f[:, None] - fc[None, :]) / (bw[None, :] / 2)) ** 2)
    _, y = signal.istft(Z * mask, fs=SR, nperseg=1024, noverlap=768)
    y = y[:n]
    return y / (np.max(np.abs(y)) + 1e-9)


def bell(freq, d=1.2, tau=0.35, partials=((1, 1.0), (2.76, 0.28), (5.4, 0.12), (0.5, 0.2))):
    t = tt(d)
    out = np.zeros_like(t)
    for m, a in partials:
        out += a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t / (tau / (0.6 + 0.4 * m)))
    out[: secs(0.002)] *= np.linspace(0, 1, secs(0.002))
    return out


def click(d=0.004, f=3000, seed=1):
    g = np.random.default_rng(seed)
    x = g.standard_normal(secs(d)) * np.hanning(secs(d))
    return filt(x, 'bp', (f * 0.6, min(f * 1.6, 20000)), 2)


def verb(x, room=0.6, wet=0.35, damp=0.5, width=1.0, pre=0.0):
    if x.ndim == 1:
        x = stereo(x)
    x = np.concatenate([x, np.zeros((secs(3.5), 2))])
    board = pb.Pedalboard([pb.Reverb(room_size=room, damping=damp, wet_level=wet, dry_level=1 - wet * 0.5, width=width)])
    y = board(x.T.astype(np.float32), SR).T
    nz = np.where(np.max(np.abs(y), axis=1) > 1e-4)[0]
    return y[: (nz[-1] + 1 if len(nz) else len(y))]


def norm(x, peak_db):
    return x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)


def softclip(x, drive=1.5):
    return np.tanh(x * drive) / np.tanh(drive)


# ---------- sound design ----------
def sfx_notify():
    buzz_t = tt(0.24)
    buzz = np.sign(np.sin(2 * np.pi * 165 * buzz_t)) * 0.5 + np.sin(2 * np.pi * 330 * buzz_t) * 0.3
    gate = ((buzz_t % 0.13) < 0.075).astype(float)
    buzz = filt(buzz * gate * np.exp(-buzz_t / 0.2), 'lowpass', 500) * 0.35
    chime = np.zeros(secs(1.4))
    for i, f in enumerate([1318.5, 1760.0]):
        s0 = secs(0.03 + i * 0.09)
        bl = bell(f, 1.2, 0.3) * (0.8 if i == 0 else 1.0)
        chime[s0:s0 + len(bl)] += bl[: len(chime) - s0]
    out = np.zeros(secs(1.4))
    out[: len(buzz)] += buzz
    out += chime * 0.55
    return norm(verb(stereo(out, 0, 0.5), 0.35, 0.22), -13)


def sfx_impact():
    sub, _ = chirp(120, 40, 0.9)
    sub = softclip(sub * expdec(0.9, 0.35, 0.001) * 1.3, 1.8)
    body = filt(rng.standard_normal(secs(0.6)), 'lowpass', 2200) * expdec(0.6, 0.09, 0.001)
    c = np.zeros(secs(0.9))
    c[: secs(0.004)] += click(0.004, 4000) * 2
    x = sub * 1.0
    x[: len(body)] += body * 0.45
    x += c * 0.5
    return norm(verb(stereo(x, 0, 0.8), 0.7, 0.28, 0.6), -3.5)


def snare_roll():
    """Tempo locked build into the drop: 8ths, then 16ths, then 32nds, rising in level and pitch."""
    beats = [20.5, 21.0, 21.5, 22.0, 22.5, 23.0, 23.25, 23.5, 23.75, 23.875, 23.9375]
    start = b(beats[0])
    out = np.zeros((secs(DROP_IN_VIDEO - start + 0.3), 2))
    for k, bt in enumerate(beats):
        p = k / (len(beats) - 1)
        n = secs(0.2)
        center = 1400 + 3800 * p
        noise = filt(rng.standard_normal(n), 'bp', (center * 0.45, min(center * 2.4, 20000)), 2) * expdec(0.2, 0.045 + 0.02 * (1 - p), 0.0008)
        body = np.sin(2 * np.pi * (185 + 90 * p) * tt(0.2)) * expdec(0.2, 0.03, 0.0008)
        hit = (noise * 0.85 + body * 0.45) * (0.42 + 0.58 * p ** 1.2)
        s0 = secs(b(bt) - start)
        out[s0:s0 + n] += stereo(hit, (k % 2 - 0.5) * 0.25, 0.4)[: len(out) - s0]
    for bt in (21.0, 22.0, 23.0):  # sub heartbeat keeps the low end alive in the track's pre drop silence
        pulse, _ = chirp(95, 48, 0.32)
        pulse = pulse * expdec(0.32, 0.09, 0.001) * 0.55
        s0 = secs(b(bt) - start)
        out[s0:s0 + len(pulse)] += stereo(pulse)[: len(out) - s0]
    out[secs(DROP_IN_VIDEO - start) - secs(0.004):] = 0
    return start, norm(verb(out, 0.45, 0.22)[: len(out)], -5)


def sfx_riser(d):
    noise = moving_band_noise(d, lambda v: 500 * (16 ** v), q=1.6, seed=5)
    env = (np.linspace(0, 1, secs(d)) ** 1.5)
    tone, f = chirp(160, 1300, d)
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(8 + 18 * np.linspace(0, 1, secs(d)) ** 2) / SR)
    saw = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.25
    x = noise * 0.7 * env + (tone * 0.35 + saw * 0.25) * env * trem
    x[-secs(0.01):] *= np.linspace(1, 0, secs(0.01))
    return norm(stereo(x, 0, 1.0), -6)


def sfx_reply():
    c, _ = chirp(700, 1500, 0.07)
    x = c * expdec(0.07, 0.03, 0.001)
    x = np.concatenate([x, np.zeros(secs(0.2))])
    x[: secs(0.004)] += click(0.004, 5000) * 0.4
    air = moving_band_noise(0.18, lambda v: 3000 + 4000 * v, 1.5, 9) * np.hanning(secs(0.18)) * 0.25
    x[: len(air)] += air
    return norm(verb(stereo(x, 0, 0.3), 0.3, 0.25), -15)


def sfx_shatter():
    d = 0.7
    x = np.zeros(secs(d))
    g = np.random.default_rng(21)
    out = np.zeros((secs(d), 2))
    for _ in range(46):
        t0 = (g.random() ** 1.8) * 0.45
        f = g.uniform(2400, 7200)
        dd = g.uniform(0.025, 0.07)
        bl = np.sin(2 * np.pi * f * tt(dd)) * expdec(dd, dd / 3, 0.0005) * g.uniform(0.3, 1.0)
        s0 = secs(t0)
        out[s0:s0 + len(bl)] += stereo(bl, g.uniform(-0.9, 0.9))[: len(out) - s0]
    burst = filt(g.standard_normal(secs(d)), 'highpass', 2500) * expdec(d, 0.12, 0.001) * 0.35
    out += stereo(burst, 0, 0.8)
    return norm(verb(out, 0.45, 0.3), -12)


def sfx_whoosh(d=0.55, f0=300, fpk=2800, f1=700, peak=0.5, pan0=-0.4, pan1=0.4, seed=3, db=-15):
    def fc(v):
        return f0 * (fpk / f0) ** (v / peak) if v < peak else fpk * (f1 / fpk) ** ((v - peak) / (1 - peak))
    x = moving_band_noise(d, fc, q=1.3, seed=seed)
    t = np.linspace(0, 1, secs(d))
    env = np.where(t < peak, (t / peak) ** 1.6, ((1 - t) / (1 - peak)) ** 1.3)
    x = x * env
    ang = (pan0 + (pan1 - pan0) * t + 1) * np.pi / 4
    y = np.stack([x * np.cos(ang), x * np.sin(ang)], axis=1)
    return norm(y, db)


def sfx_ticks(times, f0=1800, f1=2600, db=-21, dur=None):
    end = max(times) + 0.1
    out = np.zeros((secs(end), 2))
    for i, t0 in enumerate(times):
        f = f0 + (f1 - f0) * i / max(1, len(times) - 1)
        tk = np.sin(2 * np.pi * f * tt(0.012)) * expdec(0.012, 0.004, 0.0005) * 0.7 + np.pad(click(0.003, 3500, i), (0, secs(0.012) - secs(0.003)))
        s0 = secs(t0)
        out[s0:s0 + len(tk)] += stereo(tk, ((i % 5) - 2) * 0.08)
    return norm(out, db)


def sfx_count_roll():
    n = 30
    times = [0.25 + 1.3 * (i / (n - 1)) ** 1.35 for i in range(n)]
    return sfx_ticks(times, 1500, 2700, -18)


def sfx_count_roll_fast():
    n = 26
    times = [1.3 * (1 - (1 - i / (n - 1)) ** 0.45) for i in range(n)]
    return sfx_ticks(times, 1400, 2600, -18)


def sfx_lost():
    d = 0.8
    t = tt(d)
    f = 900 * (220 / 900) ** (t / d) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t))
    saw = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR)
    x = filt(saw, 'lowpass', 1800) * expdec(d, 0.35, 0.01)
    w = sfx_whoosh(0.8, 1800, 3000, 500, 0.2, 0.0, 0.8, 11, -18)
    y = stereo(x, 0.3) * 0.5 + w[: secs(d)]
    return norm(verb(y, 0.5, 0.3), -15)


def sfx_suck(d=0.9):
    x = filt(rng.standard_normal(secs(d)), 'highpass', 3500)
    env = np.exp(np.linspace(-6, 0, secs(d)))
    x = x * env
    x[-secs(0.006):] *= np.linspace(1, 0, secs(0.006))
    return norm(stereo(x, 0, 1.0), -11)


def sfx_drop():
    d = 2.6
    sub, _ = chirp(78, 36, d)
    sub = softclip(sub * expdec(d, 0.75, 0.001) * 1.4, 2.0)
    kick, _ = chirp(180, 50, 0.12)
    kick = kick * expdec(0.12, 0.05, 0.0008)
    crash = filt(rng.standard_normal(secs(d)), 'highpass', 1400) * expdec(d, 0.8, 0.002) * 0.3
    x = sub * 0.9
    x[: len(kick)] += kick * 0.8
    y = stereo(x, 0, 0.0) + stereo(crash, 0, 1.0)
    y[: secs(0.004)] += stereo(click(0.004, 4500) * 0.8)
    return norm(verb(y, 0.8, 0.25, 0.5), -2.5)


def sfx_word_hit():
    k, _ = chirp(160, 55, 0.18)
    x = k * expdec(0.18, 0.07, 0.0008)
    x[: secs(0.003)] += click(0.003, 3500) * 0.6
    return norm(stereo(x, 0, 0.2), -13)


def sfx_shimmer(base=1396.9):
    notes = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2, 3]
    out = np.zeros(secs(1.6))
    for i, m in enumerate(notes):
        s0 = secs(i * 0.055)
        bl = bell(base * m / 2, 1.0, 0.35, ((1, 1.0), (2, 0.2), (3.01, 0.08))) * (0.9 - i * 0.05)
        out[s0:s0 + len(bl)] += bl[: len(out) - s0]
    return norm(verb(stereo(out, 0, 0.8), 0.85, 0.45, 0.3), -17)


def sfx_pop(f0=420, f1=980, db=-15, d=0.08):
    c, _ = chirp(f0, f1, d)
    x = c * expdec(d, d / 2.5, 0.0008)
    x[: secs(0.002)] += click(0.002, 2500) * 0.3
    x = np.concatenate([x, np.zeros(secs(0.15))])
    return norm(verb(stereo(x, 0, 0.2), 0.25, 0.18), db)


def sfx_hub_pop():
    p = sfx_pop(180, 540, -12, 0.14)
    sub = np.sin(2 * np.pi * 70 * tt(0.3)) * expdec(0.3, 0.1, 0.002)
    p[: len(sub)] += stereo(sub) * 0.25
    return norm(p, -11)


def sfx_typing(n=6, spacing=(0.07, 0.11), db=-22, seed=4):
    g = np.random.default_rng(seed)
    times, t = [], 0.0
    for _ in range(n):
        times.append(t)
        t += g.uniform(*spacing)
    out = np.zeros((secs(t + 0.1), 2))
    for i, t0 in enumerate(times):
        tap = filt(g.standard_normal(secs(0.018)), 'bp', (700, 2600)) * expdec(0.018, 0.005, 0.0005)
        s0 = secs(t0)
        out[s0:s0 + len(tap)] += stereo(tap, g.uniform(-0.2, 0.2))
    return norm(out, db)


def sfx_tick(db=-21, f=2100):
    x = np.sin(2 * np.pi * f * tt(0.02)) * expdec(0.02, 0.006, 0.0004)
    x[: secs(0.002)] += click(0.002, 4000) * 0.5
    return norm(stereo(x), db)


def sfx_flip():
    w = sfx_whoosh(0.42, 600, 3400, 900, 0.55, -0.5, 0.5, 13, -15)
    slap = filt(rng.standard_normal(secs(0.08)), 'lowpass', 1500) * expdec(0.08, 0.02, 0.0005)
    thump = np.sin(2 * np.pi * 170 * tt(0.08)) * expdec(0.08, 0.025, 0.0005)
    out = np.zeros((secs(0.6), 2))
    out[: len(w)] += w
    s0 = secs(0.36)
    out[s0:s0 + len(slap)] += stereo(slap * 0.35 + thump * 0.35)
    return norm(verb(out, 0.3, 0.2), -13)


def sfx_success():
    out = np.zeros(secs(1.6))
    for i, f in enumerate([1046.5, 1568.0, 2093.0]):
        s0 = secs(i * 0.075)
        bl = bell(f, 1.2, 0.32) * (1.0 if i < 2 else 0.5)
        out[s0:s0 + len(bl)] += bl[: len(out) - s0]
    sp = filt(rng.standard_normal(secs(0.3)), 'highpass', 7000) * expdec(0.3, 0.08) * 0.15
    out[: len(sp)] += sp
    return norm(verb(stereo(out, 0, 0.6), 0.55, 0.3), -14)


def sfx_zip():
    c, _ = chirp(500, 2600, 0.2)
    env = np.sin(np.linspace(0, np.pi, secs(0.2))) ** 1.5
    x = c * env * 0.6 + moving_band_noise(0.2, lambda v: 1500 + 5000 * v, 2, 17) * env * 0.3
    return norm(stereo(x, 0, 0.3), -21)


def sfx_toggle():
    out = np.zeros(secs(0.25))
    a = click(0.006, 1100, 2) + np.pad(np.sin(2 * np.pi * 900 * tt(0.006)) * 0.3, (0, 0))
    bb = click(0.006, 2400, 3) * 0.8
    out[: len(a)] += a
    s0 = secs(0.065)
    out[s0:s0 + len(bb)] += bb
    thud = np.sin(2 * np.pi * 140 * tt(0.05)) * expdec(0.05, 0.015, 0.0005) * 0.5
    out[: len(thud)] += thud
    return norm(verb(stereo(out, 0, 0.2), 0.2, 0.15), -14)


def sfx_check():
    x = bell(1760, 0.6, 0.18, ((1, 1.0), (1.5, 0.35), (3, 0.1)))
    x[: secs(0.003)] += click(0.003, 4000) * 0.8
    return norm(verb(stereo(x, 0, 0.3), 0.3, 0.2), -16)


def sfx_tap():
    th = np.sin(2 * np.pi * 115 * tt(0.06)) * expdec(0.06, 0.018, 0.0005)
    x = np.concatenate([th, np.zeros(secs(0.1))])
    x[: secs(0.004)] += click(0.004, 2200) * 0.9
    return norm(verb(stereo(x), 0.2, 0.15), -11)


def sfx_finale():
    imp = sfx_impact()
    chord = np.zeros(secs(3.5))
    for f in [698.46, 880.0, 1046.5, 1396.9]:
        chord += bell(f, 3.5, 1.1, ((1, 1.0), (2, 0.15), (3.01, 0.05)))
    ch = verb(stereo(chord, 0, 0.8), 0.9, 0.5, 0.3)
    out = np.zeros((max(len(imp), len(ch)), 2))
    out[: len(imp)] += imp * 0.8
    out[: len(ch)] += norm(ch, -10)
    return norm(out, -3.5)


def sfx_type_run():
    n = 32
    times = [i * (1 / 34) + rng.uniform(-0.004, 0.004) for i in range(n)]
    times[0] = 0
    return sfx_ticks([max(0, x) for x in times], 2600, 2900, -25)


def build_sfx(cue):
    i, t = cue['id'], cue['t']
    if i == 'notify': return sfx_notify()
    if i == 'impact': return sfx_impact()
    if i == 'riserShort': return sfx_riser(max(0.1, HIT - t))
    if i == 'riser': return sfx_riser(max(0.1, DROP_IN_VIDEO - t))
    if i == 'reply': return sfx_reply()
    if i == 'shatter': return sfx_shatter()
    if i == 'typeTick': return sfx_typing(4, (0.05, 0.08), -22, 8)
    if i == 'whoosh': return sfx_whoosh(seed=int(t * 10))
    if i == 'whooshUp': return sfx_whoosh(0.6, 250, 3200, 2200, 0.8, -0.2, 0.2, int(t * 10), -15)
    if i == 'whooshLong': return sfx_whoosh(1.1, 400, 2600, 600, 0.3, 0.0, 0.9, 7, -16)
    if i == 'swoosh': return sfx_whoosh(0.42, 700, 3600, 1200, 0.45, 0.4, -0.4, int(t * 10), -16)
    if i == 'swish': return sfx_whoosh(0.26, 2000, 6500, 3000, 0.4, -0.3, 0.3, int(t * 10), -22)
    if i == 'whip': return sfx_whoosh(0.3, 900, 6000, 1500, 0.4, 0.8, -0.8, 23, -13)
    if i == 'flipDown': return sfx_whoosh(0.45, 3000, 1800, 350, 0.25, 0.0, 0.0, 29, -15)
    if i == 'countRoll': return sfx_count_roll() if t < 20 else sfx_count_roll_fast()
    if i == 'lostSweep': return sfx_lost()
    if i == 'suck': return sfx_suck(max(0.1, DROP_IN_VIDEO - t))
    if i == 'drop': return sfx_drop()
    if i == 'wordHit': return sfx_word_hit()
    if i == 'shimmer': return sfx_shimmer()
    if i == 'pop': return sfx_pop()
    if i == 'popOut': return sfx_pop(600, 1400, -15)
    if i == 'hubPop': return sfx_hub_pop()
    if i == 'chip': return sfx_pop(380 * (1 + 0.09 * ((t * 7) % 5)), 900 * (1 + 0.09 * ((t * 7) % 5)), -16)
    if i == 'typing': return sfx_typing()
    if i == 'tick': return sfx_tick()
    if i == 'tickBig': return sfx_tick(-19, 1300)
    if i == 'blip': return sfx_tick(-22, 1100)
    if i == 'flip': return sfx_flip()
    if i == 'success': return sfx_success()
    if i == 'zip': return sfx_zip()
    if i == 'toggle': return sfx_toggle()
    if i == 'check': return sfx_check()
    if i == 'tap': return sfx_tap()
    if i == 'finale': return sfx_finale()
    if i == 'typeRun': return sfx_type_run()
    raise KeyError(i)


# SFX that should end on their cue point rather than start there
ENDS_AT_TARGET = {'riserShort', 'riser', 'suck'}


def automation(t):
    """Music gain: muffled start is handled separately. Gap before the drop, fade on the end card."""
    g = np.ones_like(t)
    g *= np.clip(t / 0.12, 0, 1)                               # tiny fade in to avoid a click
    gap0, gap1 = DROP_IN_VIDEO - 0.16, DROP_IN_VIDEO - 0.012
    g *= np.where((t > gap0) & (t < gap1), 0.18, 1.0)           # breath before the drop
    return g


def main():
    out_path = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(HERE, 'mix.wav')
    cues = json.load(open(os.path.join(HERE, 'cues.json')))['cues']

    # ---- music edit ----
    track = load_audio(MUSIC)
    s0 = secs(OFFSET)
    m = track[s0:s0 + N].copy()
    t = np.arange(N) / SR

    # sleepy low pass until the hit, then the filter opens
    open0, open1 = HIT - 0.42, HIT + 0.02
    cuts = [380, 700, 1400, 3000, 7000]
    stages = [filt(m, 'lowpass', c, 4) for c in cuts]
    pos = np.clip((t - open0) / (open1 - open0), 0, 1)       # 0 muffled, 1 open
    idx = pos * len(cuts)                                    # 0..len(cuts), last stage is the dry track
    wet = np.zeros_like(m)
    layers = stages + [m]
    for k, layer in enumerate(layers):
        w = np.clip(1 - np.abs(idx - k), 0, 1)
        wet += layer * w[:, None]
    m = wet * (1 + 0.35 * (1 - pos))[:, None]

    # ending: freeze the final downbeat into a reverb bloom under the end card
    e0 = secs(END_HIT)
    dry_keep = END_HIT + 0.42
    fade = np.clip(1 - (t - dry_keep) / 0.18, 0, 1)
    tail_src = track[s0 + e0 - secs(0.03): s0 + e0 + secs(0.55)].copy()
    tail_src *= np.hanning(len(tail_src) * 2)[len(tail_src):][:, None] ** 0.5
    bloom = pb.Pedalboard([pb.Reverb(room_size=0.97, damping=0.35, wet_level=1.0, dry_level=0.0, width=1.0), pb.LowpassFilter(6500)])(
        np.concatenate([tail_src, np.zeros((secs(6), 2), dtype=np.float32)]).T.astype(np.float32), SR).T
    freeze = pb.Pedalboard([pb.Reverb(room_size=0.9, damping=0.5, wet_level=1.0, dry_level=0.0, width=1.0, freeze_mode=1.0), pb.LowpassFilter(3800)])(
        np.concatenate([tail_src[: secs(0.35)], np.zeros((secs(6), 2), dtype=np.float32)]).T.astype(np.float32), SR).T
    m = m * fade[:, None]
    ln = min(len(bloom), N - e0)
    m[e0:e0 + ln] += bloom[:ln] * 0.9
    fz = freeze[:ln]
    fz_env = np.clip((np.arange(ln) / SR) / 0.6, 0, 1) * np.clip(1 - ((np.arange(ln) / SR) + END_HIT - 57.2) / 2.6, 0, 1)
    m[e0:e0 + ln] += norm(fz, -20) * fz_env[:, None]
    m *= automation(t)[:, None]
    m *= 10 ** (-3.5 / 20)
    # final fade so the last frame lands in silence
    m *= (np.clip((DUR - t) / 1.2, 0, 1) ** 1.5)[:, None]

    # ---- sound design ----
    sfx = np.zeros((N + secs(8), 2))
    duck = np.ones(N)
    for c in cues:
        x = build_sfx(c) * c.get('gain', 1.0)
        pan = c.get('pan', 0.0)
        if pan:
            ang = (pan + 1) * np.pi / 4
            x = np.stack([x[:, 0] * np.cos(ang) * 1.41, x[:, 1] * np.sin(ang) * 1.41], axis=1)
        start = c['t']
        if c['id'] in ENDS_AT_TARGET:
            target = HIT if c['id'] == 'riserShort' else DROP_IN_VIDEO
            start = target - len(x) / SR
        i0 = max(0, secs(start))
        sfx[i0:i0 + len(x)] += x[: len(sfx) - i0]
        if c['id'] in ('impact', 'drop', 'finale'):
            d0 = secs(c['t'])
            dl = secs(0.45)
            env = 1 - 0.3 * np.exp(-np.arange(dl) / secs(0.18))
            duck[d0:d0 + dl] = np.minimum(duck[d0:d0 + dl], env[: N - d0])
    roll_t, roll = snare_roll()
    r0 = secs(roll_t)
    sfx[r0:r0 + len(roll)] += roll * 0.95
    sfx = sfx[:N]
    mix = m * duck[:, None] + sfx * 0.9

    # ---- master ----
    master = pb.Pedalboard([
        pb.HighpassFilter(28),
        pb.Compressor(threshold_db=-16, ratio=2.2, attack_ms=12, release_ms=160),
    ])
    y = master(mix.T.astype(np.float32), SR).T.astype(np.float64)
    y = limit(y, -3.0)
    meter = pyln.Meter(SR)
    for _ in range(3):  # converge on -14 LUFS with a -1.5 dBTP ceiling
        lufs = meter.integrated_loudness(y)
        y = limit(y * 10 ** ((-14.0 - lufs) / 20), -3.8)
    y[-secs(0.02):] *= np.linspace(1, 0, secs(0.02))[:, None]
    lufs2 = meter.integrated_loudness(y)
    tp = 20 * np.log10(np.max(np.abs(signal.resample_poly(y, 4, 1, axis=0))))
    import soundfile as sf
    sf.write(out_path, y.astype(np.float32), SR, subtype='PCM_24')
    print(f'wrote {out_path}  {len(y) / SR:.2f}s  integrated {lufs2:.2f} LUFS  true peak {tp:.2f} dBTP  offset {OFFSET:.3f}s')


def limit(x, ceiling_db, look=0.004, release=0.09):
    """Lookahead brickwall limiter (no makeup gain)."""
    from scipy.ndimage import maximum_filter1d
    c = 10 ** (ceiling_db / 20)
    L = secs(look)
    peak = np.max(np.abs(x), axis=1)
    pk = maximum_filter1d(peak, size=2 * L + 1)
    target = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    # release smoothing: gain can drop instantly (lookahead handles attack) but recovers slowly
    rel = np.exp(-1.0 / (release * SR))
    g = target.copy()
    idx = np.where(target < 1.0)[0]
    if len(idx):
        cur = 1.0
        out = np.empty_like(target)
        for i in range(len(target)):
            tg = target[i]
            cur = tg if tg < cur else tg + (cur - tg) * rel
            out[i] = cur
        g = out
    # smooth the attack edge a little
    g = signal.filtfilt(*signal.butter(1, 400 / (SR / 2)), g)
    g = np.minimum(g, target * 1.0 + (1 - target) * 0)
    return x * g[:, None]


if __name__ == '__main__':
    main()
