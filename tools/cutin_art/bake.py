#!/usr/bin/env python3
"""Bake Naga Eleven's cut-in art from ChatGPT's sheets (concepts/naga-eleven/cutin-art/README.md).

    python3 tools/cutin_art/bake.py    writes apps/web/games/naga-eleven/src/art/cutin-art.js

The strike is Sochetra's, painted in key colours: his kit in greys, his hair silver-white. Its
pixels become the portraits' letters (src/render/portraits/legend.js), so the cut-in paints them
in the colours his portrait has in that match: his skin, his hair, his side's shirt.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'face_kit'))
sys.path.insert(0, os.path.dirname(HERE))

from PIL import Image  # noqa: E402

from cells import cut, read_cell  # noqa: E402
from encode import encode, module  # noqa: E402
from label import light  # noqa: E402

SOURCE = os.path.join(ROOT, 'concepts/naga-eleven/cutin-art/chatgpt')
OUT = os.path.join(ROOT, 'apps/web/games/naga-eleven/src/art/cutin-art.js')
HEADER = ('// baked by tools/cutin_art/bake.py from concepts/naga-eleven/cutin-art/; change the sheets\n'
          '// and bake again rather than edit these lines, which are pixels\n')

STRIKE_BLOCK = 4.8
STRIKE_FRAMES = 5

# where, in each frame read back, the hair is, and the ball and the boots: ChatGPT painted them all
# in the same few greys, so only where they lie tells them apart (x, y, right, bottom)
HAIR = [(20, 0, 64, 19), (34, 0, 74, 19), (26, 0, 66, 19), (20, 0, 62, 18), (14, 0, 60, 19)]
GEAR = [
    [(48, 76, 68, 96), (0, 76, 14, 90)],
    [(52, 72, 74, 95), (0, 74, 16, 90)],
    [(55, 74, 76, 97), (0, 40, 20, 54)],
    [(57, 64, 78, 86), (46, 72, 64, 86)],
    [(63, 42, 82, 61)],
]
# the boots on the ground: the frame's lowest rows
BOOT_ROWS = 12

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


def kind_of(point, pixel, index, height):
    if sum(pixel) < 90:
        return 'outline'
    if pixel[0] > pixel[2] + 25:
        return 'skin'
    if inside(point, [HAIR[index]]):
        return 'hair'
    if inside(point, GEAR[index]) or point[1] >= height - BOOT_ROWS or light(pixel) > 215:
        return 'gear'
    return 'kit'


def gear_letter(pixel):
    value = light(pixel)
    return 'w' if value > 200 else 'e' if value > 120 else 'O'


def letters_of(frame, index):
    px = pixels_of(frame)
    kinds = {k: kind_of(k, p, index, frame.height) for k, p in px.items()}
    ranges = {}
    for kind in ('skin', 'hair', 'kit'):
        values = [light(px[k]) for k in px if kinds[k] == kind] or [0]
        ranges[kind] = (min(values), max(values))
    letters = {}
    for k, kind in kinds.items():
        value = light(px[k])
        letters[k] = {
            'outline': lambda: 'O',
            'gear': lambda: gear_letter(px[k]),
            'skin': lambda: shade(value, *ranges['skin'], SKIN),
            'hair': lambda: shade(value, *ranges['hair'], HAIR_LETTERS, HAIR_LEAN),
            'kit': lambda: shade(value, *ranges['kit'], KIT),
        }[kind]()
    return letters


def main():
    sheet = Image.open(os.path.join(SOURCE, 'strike.webp')).convert('RGB')
    parts = {}
    for index, cell in enumerate(cut(sheet)[:STRIKE_FRAMES]):
        frame = read_cell(cell, STRIKE_BLOCK)
        letters = letters_of(frame, index)
        parts[f'strike-{index + 1}'] = encode(letters, (frame.width / 2, frame.height - 1))
    with open(OUT, 'w') as out:
        out.write(module('CUTIN_FRAMES', parts, HEADER))
    print(f'baked {len(parts)} strike frames into {OUT}')


if __name__ == '__main__':
    main()
