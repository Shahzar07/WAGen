#!/usr/bin/env bash
# Final delivery encode: H.264 High, 1080x1920, 30 fps, BT.709, AAC 48 kHz stereo, faststart.
# Usage: tools/master.sh [silent.mkv] [mix.wav] [out.mp4]
set -euo pipefail
cd "$(dirname "$0")/.."
SILENT=${1:-out/silent.mkv}
MIX=${2:-audio/mix.wav}
OUT=${3:-out/nosh-whatsapp-ai-agent-reel-60s-1080x1920.mp4}
# Chunks are written with ffmpeg's default RGB to YUV matrix (BT.601); convert to BT.709 and tag it.
ffmpeg -hide_banner -y -i "$SILENT" -i "$MIX" -map 0:v:0 -map 1:a:0 \
  -vf "scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=tv:out_range=tv,format=yuv420p" \
  -c:v libx264 -profile:v high -level:v 4.2 -preset slow -crf 17 -maxrate 11M -bufsize 22M \
  -g 60 -keyint_min 30 -r 30 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -ac 2 \
  -t 60 -movflags +faststart "$OUT"
echo "wrote $OUT"
