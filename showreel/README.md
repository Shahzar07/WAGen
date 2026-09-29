# Nosh AI Automation · WhatsApp AI Agent · Reels ad

60 second motion graphics ad for Instagram and Facebook Reels, 1080x1920, 30 fps, H.264 + AAC.

**Final video:** [`out/nosh-whatsapp-ai-agent-reel-60s-1080x1920.mp4`](out/nosh-whatsapp-ai-agent-reel-60s-1080x1920.mp4)

Suggested ad cover frame: [`out/cover-1080x1920.jpg`](out/cover-1080x1920.jpg) (0:03.3, headline plus both instant replies).

## Creative direction: "The night shift"

The film plays out over one UAE night. It opens on a quiet night sky over a stylised skyline
(Burj Khalifa, Burj Al Arab, Museum of the Future) at 11:12 PM. Real customer messages from
the landing page arrive and the headline lands: *You sleep. Your business doesn't.* The city's
windows switch on as the replies go out. The film then runs through the problem, the product
and the offer, and resolves on *Sleep easy. We've got this.* with dawn light on the skyline.

Brand system taken from the live offer page: deep plum `#120c19`, lavender `#b292f9`, WhatsApp green,
amber for problem stats, Poppins + Space Mono, IBM Plex Sans Arabic for Arabic. The chat UI mirrors the
page's own "Business WhatsApp" widget so the ad and the landing page feel like one experience.

Motion toolkit on show: kinetic type with masked line reveals and spring physics, a particle system
(the two notifications shatter into the 84 unanswered messages, 26 of which peel away to competitors,
then everything implodes into the drop), a 3D card flip from English to Arabic, a chat that collapses into
an integration hub, live UI toggles, rolling odometers, drawn check marks, light, grain, camera float
and punches, and true motion blur (4 subframes per frame, 180 degree shutter).

## Edit, locked to the music (117 BPM, 1 bar = 2.05 s)

| Beats | Time | Scene | On screen copy (from noshaiautomation.com/whatsappuae) |
|---|---|---|---|
| 0 to 10 | 0.0 to 5.1 | Hook | Ahlan! Built for UAE businesses · You sleep. Your business doesn't. · page chat examples, "Replied in 4 seconds", "Replied in 3 seconds" |
| 10 to 24 | 5.1 to 12.3 | Problem | The problem · Missed messages = lost customers. · 84 Messages never answered / day · ~26 Customers lost to competitors |
| 24 to 32 | 12.3 to 16.4 | Drop and reveal | What we build · One WhatsApp. Every customer answered. · A WhatsApp AI agent for your business, built, trained and run for you. |
| 32 to 88 | 16.4 to 45.1 | 7 features, 2 bars each | Instant replies · English + Arabic · Books the job · Fits your systems (booking system, CRM, POS; your team learns no new software) · Your number stays yours (setup handled by us) · Your team can take over · Kept up to date (support included) |
| 88 to 96 | 45.1 to 49.2 | Proof | 48+ businesses trust us across the UAE · Restaurants, Clinics, Salons, Real Estate, Retail |
| 96 to 104 | 49.2 to 53.3 | Offer | Free demo · See it answer your own customer questions. · Free, with no commitment. · Pick a demo time that suits you. · Nothing changes on your current number until you approve it. |
| 104 to 117 | 53.3 to 60.0 | CTA and end card | Yalla, let's set it up · the page's short form · Sleep easy. We've got this. · Get My Free Demo · noshaiautomation.com/whatsappuae |

Copy rules applied: only the brand's own messaging, no dashes and no emojis in on screen text (the UAE flag
is drawn, not an emoji), no invented stats, clients, logos, testimonials or pricing. Demo phone numbers are masked or
shown as the form's own placeholder. The logo is a **text wordmark** ("NOSH AI / AUTOMATION") because no logo file was supplied.

Reels safe zones: all text sits inside x 65 to 1015 and y 269 to 1248 (Meta guidance: keep the top 14%,
bottom 35% and 6% on each side clear). The skyline and glow live in the lower zone as decoration only.
Everything reads with sound off.

## Sound

* Music: **"Fireworks" by Alexander Nakarada**, released to the public domain (CC0) through FreePD
  (FreePD closed in 2025; mirror: archive.org/details/freepd). No attribution required; credited here anyway.
  Edited so the track's drop hits the "One WhatsApp." reveal. It is muffled while "you sleep" and the
  filter opens on "Your business doesn't.". The end card freezes the final downbeat into a reverb bloom.
* Sound design: all effects are synthesised in [`audio/build_audio.py`](audio/build_audio.py): notification chimes,
  impacts, whooshes, pops, typing, ticks, card flips, a tempo locked snare build and a riser. They are placed from
  [`audio/cues.json`](audio/cues.json), which the animation timeline exports, so picture and sound share one clock.
* Master: -14 LUFS integrated, about -2.2 dBTP true peak after encoding, 48 kHz stereo AAC 320 kbps
  (the native ffmpeg AAC encoder produced isolated overshoot spikes at 256 kbps).

## Rebuild

Requirements: Node 18+, Chromium via Playwright, Python 3.10+, ffmpeg with libx264.

```bash
cd showreel
npm install
python3 -m venv .venv && .venv/bin/pip install numpy scipy soundfile pedalboard pyloudnorm
node tools/cues.mjs > audio/cues.json               # export SFX cue sheet from the timeline
.venv/bin/python audio/build_audio.py               # music edit + sound design + master -> audio/mix.wav
node tools/render.mjs --workers 4 --sub 4           # frames -> out/silent.mkv (motion blurred)
tools/master.sh                                     # delivery MP4 in out/
```

Handy while designing: `node tools/preview.mjs 2.2,12.4,30 preview --guides` renders stills with the Reels
safe zones overlaid, and `index.html?play` plays the timeline in a browser.

## Structure

```
index.html, styles.css      stage (1080x1920) and design tokens
src/lib.js                  easing, springs, keyframes, DOM helpers, Lucide icons
src/bg.js                   night sky, light blooms, stars, skyline, grain, vignette
src/components.js           chat card, notification, odometer, masked lines, wordmark, check rows
src/main.js                 beat grid, scene registry, camera, flashes, cue sheet
src/scenes/s1..s7           the seven scenes
tools/                      renderer, preview, cue export, master encode
audio/                      music, cue sheet, sound design and mix
fonts/                      Poppins, Space Mono, IBM Plex Sans Arabic (SIL OFL 1.1)
```

Every frame is a pure function of time, so any frame can be rendered in isolation and in parallel.

Credits: fonts under the SIL Open Font License 1.1 (see `fonts/`), icons from Lucide (ISC license).
