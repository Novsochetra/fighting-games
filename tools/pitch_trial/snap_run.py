#!/usr/bin/env python3
"""Snap PixelLab's new-style run to the pitch sprites' kit colours (concepts/naga-eleven/pitch-trial/).

    python3 tools/pitch_trial/snap_run.py    writes concepts/naga-eleven/pitch-trial/run-trial.png

The game recolours a footballer shade for shade (src/art/sprite-kit.js), so a pixel off the kit's
exact colours keeps the red of the sheet whatever team wears it. The trial sheet is the game's
run.png with its south and east rows swapped for the new frames; copy it over run.png to play it.
"""
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TRIAL = os.path.join(ROOT, 'concepts/naga-eleven/pitch-trial')
RUN = os.path.join(ROOT, 'apps/web/games/naga-eleven/assets/sprites/run.png')
FRAME = (64, 62)
FRAMES = 6
ROWS = {'south': 0, 'east': 2}
# the current run's lowest sole is on this row in every direction
SOLE_ROW = 60
# PixelLab shades the far leg in the shirt's deep red; below the waist a red is skin
WAIST_ROW = 42
HEAD_ROWS = 16


def rgb(text):
    return tuple(int(text[i:i + 2], 16) for i in (0, 2, 4))


RAMPS = {'shirt': '4d061d 89122a bd1f23 db3128', 'shorts': '59677a 8596a7 abbeca ebf3f8',
         'socks': '1a1a61 383789 4e58ae', 'skin': '68201d 90412e bf7448 da8661',
         'hair': '100f0f 2d2c2d 56555b'}
# in no ramp: drawn once and never recoloured
KEEP = {'outline': '000000', 'boot': 'f4f4f6 b8bcc8', 'eye': 'f2eae0'}
PALETTE = [(name, rgb(c)) for name, colours in {**RAMPS, **KEEP}.items() for c in colours.split()]
OUTLINE = rgb('000000')


def distance(first, second):
    return 2 * (first[0] - second[0]) ** 2 + 4 * (first[1] - second[1]) ** 2 + 3 * (first[2] - second[2]) ** 2


def nearest(pixel, parts=None):
    allowed = [colour for name, colour in PALETTE if parts is None or name in parts]
    return min(allowed, key=lambda colour: distance(pixel, colour))


def snap(pixel, y, head_bottom):
    red, green, blue = pixel
    if red > blue + 40 and green > 0.45 * red:
        return nearest(pixel, {'skin'})
    if red > 110 and green < 0.4 * red:
        return nearest(pixel, {'skin'} if y >= WAIST_ROW else {'shirt'})
    if red + green + blue < 100:
        return nearest(pixel, {'hair', 'outline'}) if y < head_bottom else OUTLINE
    return nearest(pixel)


def snapped(image, shift):
    head_bottom = image.getbbox()[1] + HEAD_ROWS
    out = Image.new('RGBA', FRAME, (0, 0, 0, 0))
    for y in range(shift, min(image.height, FRAME[1] + shift)):
        for x in range(FRAME[0]):
            pixel = image.getpixel((x, y))
            if pixel[3] > 0:
                out.putpixel((x, y - shift), snap(pixel[:3], y, head_bottom) + (255,))
    return out


def main():
    sheet = Image.open(RUN).convert('RGBA')
    width, height = FRAME
    for direction, row in ROWS.items():
        frames = [Image.open(os.path.join(TRIAL, f'pixellab/run-{direction}-{i}.png')).convert('RGBA')
                  for i in range(FRAMES)]
        shift = max(frame.getbbox()[3] - 1 for frame in frames) - SOLE_ROW
        for i, frame in enumerate(frames):
            box = (i * width, row * height, (i + 1) * width, (row + 1) * height)
            sheet.paste((0, 0, 0, 0), box)
            sheet.alpha_composite(snapped(frame, shift), box[:2])
    sheet.save(os.path.join(TRIAL, 'run-trial.png'))
    print(f'wrote {os.path.join(TRIAL, "run-trial.png")}')


if __name__ == '__main__':
    main()
