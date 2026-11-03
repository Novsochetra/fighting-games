#!/usr/bin/env python3
"""Bake Naga Eleven's cut-in art from ChatGPT's sheets (concepts/naga-eleven/cutin-art/README.md).

    python3 tools/cutin_art/bake.py    writes apps/web/games/naga-eleven/src/art/cutin-art.js

The players are painted in key colours, their kits in greys and their hair silver-white; their
pixels become the portraits' letters (src/render/portraits/legend.js), so the cut-in paints them
in the colours each player's portrait has in that match. The ball and the net are painted like
the effects, in greys and a bright green, and become the effects' codes (tools/effect_kit/codes.py).
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'face_kit'))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'effect_kit'))
sys.path.insert(0, os.path.dirname(HERE))

from PIL import Image  # noqa: E402

from cells import cut, read_cell  # noqa: E402
from codes import codes_of  # noqa: E402
from encode import encode, module  # noqa: E402
from figures import FIGURES  # noqa: E402
from label import light  # noqa: E402

SOURCE = os.path.join(ROOT, 'concepts/naga-eleven/cutin-art/chatgpt')
OUT = os.path.join(ROOT, 'apps/web/games/naga-eleven/src/art/cutin-art.js')
HEADER = ('// baked by tools/cutin_art/bake.py from concepts/naga-eleven/cutin-art/; change the sheets\n'
          '// and bake again rather than edit these lines, which are pixels\n')

# the ball flying at the camera and the net ripping, held by their middles
EFFECTS = {'ball': 6.3, 'net': 4.9}

SKIN = '4321'
HAIR_LETTERS = 'kghH'
KIT = 'DCBA'
HAIR_LEAN = 1.6


def inside(point, boxes):
    x, y = point
    return any(left <= x < right and top <= y < bottom for left, top, right, bottom in boxes)


def shade(value, low, high, letters, lean=1.0):
    share = max(0.0, (value - low) / max(1, high - low)) ** lean
    return letters[max(0, min(len(letters) - 1, int(share * len(letters))))]


def pixels_of(frame):
    rgba = frame.convert('RGBA')
    return {(x, y): rgba.getpixel((x, y))[:3] for y in range(rgba.height) for x in range(rgba.width)
            if rgba.getpixel((x, y))[3]}


def is_gold(pixel):
    red, green, blue = pixel
    return red > 150 and green > 0.8 * red and blue < 0.6 * green


def kind_of(point, pixel, frame, figure):
    if sum(pixel) < 90:
        return 'outline'
    if is_gold(pixel):
        return 'gold'
    if pixel[0] > pixel[2] + 25:
        return 'skin'
    if inside(point, frame['hair']):
        return 'hair'
    low = point[1] >= frame['height'] - figure.get('boot_rows', 0)
    if inside(point, frame.get('gear', [])) or low or light(pixel) > figure['white']:
        return 'gear'
    return 'kit'


def gear_letter(pixel):
    value = light(pixel)
    return 'w' if value > 200 else 'e' if value > 120 else 'O'


def letters_of(image, frame, figure):
    px = pixels_of(image)
    frame = {**frame, 'height': image.height}
    kinds = {k: kind_of(k, p, frame, figure) for k, p in px.items()}
    ranges = {}
    for kind in ('skin', 'hair', 'kit'):
        values = [light(px[k]) for k in px if kinds[k] == kind] or [0]
        ranges[kind] = (min(values), max(values))
    shading = {
        'outline': lambda value: 'O',
        'gold': lambda value: 'M' if value > 180 else 'N',
        'skin': lambda value: shade(value, *ranges['skin'], SKIN),
        'hair': lambda value: shade(value, *ranges['hair'], HAIR_LETTERS, HAIR_LEAN),
        'kit': lambda value: shade(value, *ranges['kit'], KIT),
    }
    return {k: gear_letter(px[k]) if kind == 'gear' else shading[kind](light(px[k])) for k, kind in kinds.items()}


def bake_figures():
    parts = {}
    for name, figure in FIGURES.items():
        sheet = Image.open(os.path.join(SOURCE, f'{name}.webp')).convert('RGB')
        for index, frame in enumerate(figure['frames']):
            image = read_cell(cut(sheet)[index], figure['block'])
            anchor = (image.width / 2, image.height - 1)
            parts[f'{name}-{index + 1}'] = encode(letters_of(image, frame, figure), anchor)
    return parts


def bake_effects():
    parts = {}
    for name, block in EFFECTS.items():
        for index, cell in enumerate(cut(Image.open(os.path.join(SOURCE, f'{name}.webp')).convert('RGB'))):
            image = read_cell(cell, block)
            parts[f'{name}-{index + 1}'] = encode(codes_of(image), (image.width / 2, image.height / 2))
    return parts


def main():
    parts = {**bake_figures(), **bake_effects()}
    with open(OUT, 'w') as out:
        out.write(module('CUTIN_FRAMES', parts, HEADER))
    print(f'baked {len(parts)} cut-in frames into {OUT}')


if __name__ == '__main__':
    main()
