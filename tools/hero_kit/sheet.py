"""Draws a look in all eight directions, for a look by eye."""

import sys

from PIL import Image

from compose import painted, stacked
from palette import OUTLINE, RAMPS
from render import FACINGS

DRAWN = list(FACINGS)


def sheet(look, out, scale=4, background=(92, 150, 84, 255)):
    colours = {**RAMPS, 'outline': OUTLINE, **look.get('colours', {})}
    frames = [painted(stacked(look, direction), colours) for direction in DRAWN]
    width, height = frames[0].size
    strip = Image.new('RGBA', (width * len(frames), height), background)

    for index, frame in enumerate(frames):
        strip.alpha_composite(frame, (index * width, 0))

    strip.resize((strip.width * scale, strip.height * scale), Image.NEAREST).save(out)


if __name__ == '__main__':
    sheet({'hair': sys.argv[2] if len(sys.argv) > 2 else 'none'}, sys.argv[1])
