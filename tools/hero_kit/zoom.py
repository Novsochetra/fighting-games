"""A crop of a layer stack blown up with a pixel grid and row and column numbers, to edit by."""

import sys

from PIL import Image, ImageDraw

from compose import painted, stacked
from palette import OUTLINE, RAMPS


def zoom(look, direction, box, out, scale=14):
    left, top, right, bottom = box
    image = painted(stacked(look, direction), {**RAMPS, 'outline': OUTLINE}).crop(box)
    margin = 28
    canvas = Image.new('RGB', (image.width * scale + margin, image.height * scale + margin), (250, 250, 250))
    backdrop = Image.new('RGBA', image.size, (200, 214, 196, 255))
    backdrop.alpha_composite(image)
    canvas.paste(backdrop.resize((image.width * scale, image.height * scale), Image.NEAREST), (margin, margin))
    draw = ImageDraw.Draw(canvas)

    for x in range(image.width + 1):
        shade = (60, 60, 60) if (left + x) % 5 == 0 else (170, 170, 170)
        draw.line([(margin + x * scale, margin), (margin + x * scale, canvas.height)], fill=shade)

        if (left + x) % 5 == 0 and x < image.width:
            draw.text((margin + x * scale + 2, 4), str(left + x), fill=(0, 0, 0))

    for y in range(image.height + 1):
        shade = (60, 60, 60) if (top + y) % 5 == 0 else (170, 170, 170)
        draw.line([(margin, margin + y * scale), (canvas.width, margin + y * scale)], fill=shade)

        if (top + y) % 5 == 0 and y < image.height:
            draw.text((2, margin + y * scale + 2), str(top + y), fill=(0, 0, 0))

    canvas.save(out)


if __name__ == '__main__':
    hair = sys.argv[3] if len(sys.argv) > 3 else 'none'
    zoom({'hair': hair}, sys.argv[1], tuple(int(v) for v in sys.argv[2].split(',')), sys.argv[4] if len(sys.argv) > 4 else 'zoom.png')
