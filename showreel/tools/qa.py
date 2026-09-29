"""Delivery checks for the final MP4: specs, loudness, colour accuracy against direct renders.

Usage: python tools/qa.py out/video.mp4 [reference_dir]
reference_dir holds PNGs named t_SSS.ss.png rendered by tools/preview.mjs at the same timestamps.
"""
import glob
import json
import os
import re
import subprocess
import sys

import numpy as np
from PIL import Image

mp4 = sys.argv[1]
ref_dir = sys.argv[2] if len(sys.argv) > 2 else None

probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', mp4], capture_output=True, text=True).stdout)
v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
a = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
fmt = probe['format']
print(f"container  {fmt['format_name']}  {float(fmt['duration']):.3f}s  {int(fmt['size']) / 1e6:.1f} MB  {int(fmt['bit_rate']) / 1e6:.2f} Mbps")
print(f"video      {v['codec_name']} {v.get('profile')} L{v.get('level')}  {v['width']}x{v['height']}  {v['r_frame_rate']} fps  {v['pix_fmt']}  "
      f"matrix={v.get('color_space')} primaries={v.get('color_primaries')} trc={v.get('color_transfer')} range={v.get('color_range')}  frames={v.get('nb_frames')}")
print(f"audio      {a['codec_name']} {a.get('profile')}  {a['sample_rate']} Hz  {a['channels']} ch  {int(a.get('bit_rate', 0)) / 1000:.0f} kbps")

ebu = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', mp4, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
summary = ebu[ebu.rfind('Summary:'):]
I = re.search(r'I:\s+(-?[\d.]+) LUFS', summary)
TP = re.search(r'Peak:\s+(-?[\d.]+) dBFS', summary)
print(f"loudness   integrated {I.group(1) if I else '?'} LUFS   true peak {TP.group(1) if TP else '?'} dBTP")

if ref_dir:
    worst = 0
    for f in sorted(glob.glob(os.path.join(ref_dir, 't_*.png'))):
        t = float(os.path.basename(f)[2:-4])
        # frame index nearest to t; renders are centred on frame times
        k = round(t * 30)
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-vf', f'select=eq(n\\,{k}),scale=in_color_matrix=bt709:in_range=tv,format=rgb24', '-frames:v', '1', '-f', 'rawvideo', '-'], capture_output=True).stdout
        vid = np.frombuffer(raw, np.uint8).reshape(1920, 1080, 3).astype(float)
        ref = np.asarray(Image.open(f).convert('RGB')).astype(float)
        # compare heavily blurred means per region so motion blur and grain do not count
        def blocks(x):
            return x.reshape(24, 80, 12, 90, 3).mean(axis=(1, 3))
        d = np.abs(blocks(vid) - blocks(ref))
        worst = max(worst, d.mean())
        print(f"colour     t={t:6.2f}s frame {k:4d}  mean abs diff {d.mean():5.2f}  max block diff {d.max():6.2f}")
    print(f"colour     worst mean diff {worst:.2f} (0 to 255 scale)")
