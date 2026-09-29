# Contact sheet: python sheet.py out.png cols img1 img2 ...
import sys, os
from PIL import Image, ImageDraw, ImageFont
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
tw, th = 360, 640
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 8) + 8, rows * (th + 40) + 8), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
    x, y = 8 + (i % cols) * (tw + 8), 8 + (i // cols) * (th + 40)
    sheet.paste(im, (x, y + 32))
    d.text((x + 4, y + 6), os.path.basename(f)[2:-4] + 's', fill=(255, 255, 0))
sheet.save(out)
print(out, sheet.size)
