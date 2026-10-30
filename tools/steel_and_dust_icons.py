#!/usr/bin/env python3
"""Steel & Dust's tab and app icons, made from its logo.

    python3 tools/steel_and_dust_icons.py [OUT_DIR]

Reads concepts/logo/steel-and-dust.webp (the logo drawn on magenta), keys the magenta out and writes
every size the game's page and manifest name to apps/web/games/steel-and-dust/assets/icons/ (or OUT_DIR):
  icon-32.png                  the logo alone on a see-through square, for the browser tab
  icon-192.png, icon-512.png   the logo on the dusk sky, full bleed, for desktops and the arcade's leaderboard
  icon-maskable-512.png        the same, the logo inside Android's safe circle
  apple-touch-icon.png         180 x 180 full bleed; iOS rounds the corners itself
"""
import os
import sys

import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(REPO, 'concepts', 'logo', 'steel-and-dust.webp')
OUT_DIR = os.path.join(REPO, 'apps', 'web', 'games', 'steel-and-dust', 'assets', 'icons')

# The sky of the title screen: night above, the sun going down behind Angkor below.
SKY = ((0.0, (21, 17, 28)), (0.45, (31, 22, 40)), (0.8, (120, 46, 30)), (1.0, (232, 104, 34)))
FULL_BLEED_FIT = 0.92
# Android crops a maskable icon to any shape inside the circle of 80% of its width.
SAFE_RADIUS = 0.4
FRINGE_PASSES = 4


def neighbours_of(mask):
    grown = mask.copy()
    grown[1:, :] |= mask[:-1, :]
    grown[:-1, :] |= mask[1:, :]
    grown[:, 1:] |= mask[:, :-1]
    grown[:, :-1] |= mask[:, 1:]
    return grown


def key_out_magenta(image):
    red, green, blue = (np.asarray(image, dtype=int)[..., channel] for channel in range(3))
    background = (red > 170) & (blue > 170) & (green < 100)
    # magenta blended into the logo's dark outline: red and blue both well above green, which none
    # of its stone, gold or skin has
    spill = np.minimum(red, blue) - green
    fringe = spill > 30
    for _ in range(FRINGE_PASSES):
        background |= fringe & neighbours_of(background)

    # the tinted outline the passes leave (pockets the magenta reached only through the art) goes
    # back to the dark it was drawn
    untinted = np.where(fringe, spill, 0)
    rgb = np.stack([red - untinted, green, blue - untinted], axis=2).astype(np.uint8)
    alpha = np.where(background, 0, 255).astype(np.uint8)
    logo = Image.fromarray(np.dstack([rgb, alpha]), 'RGBA')

    return logo.crop(logo.getbbox())


def shrink(logo, scale):
    # Shrunk premultiplied, so the magenta-free edge pixels blend into nothing rather than black.
    size = (round(logo.width * scale), round(logo.height * scale))
    return logo.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')


def sky(size):
    stops, colours = zip(*SKY)
    rows = np.linspace(0, 1, size)
    column = np.stack([np.interp(rows, stops, [c[i] for c in colours]) for i in range(3)], axis=1)
    rgb = np.repeat(column[:, None, :], size, axis=1).round().astype(np.uint8)

    return Image.fromarray(rgb).convert('RGBA')


def centred(logo, backdrop, scale):
    art = shrink(logo, scale)
    backdrop.alpha_composite(art, ((backdrop.width - art.width) // 2, (backdrop.height - art.height) // 2))

    return backdrop


def fit_scale(logo, size, share):
    return share * size / max(logo.size)


def safe_scale(logo, size):
    ys, xs = np.nonzero(np.asarray(logo.getchannel('A')))
    farthest = np.hypot(xs - logo.width / 2, ys - logo.height / 2).max()

    return SAFE_RADIUS * size / farthest


def few_colours(image):
    # The logo's painted grain makes a full-colour PNG of it 300 kB; 256 colours keep the look at a third.
    return image.convert('RGB').quantize(256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)


def icons(logo):
    clear = lambda size: Image.new('RGBA', (size, size))
    full_bleed = lambda size: few_colours(centred(logo, sky(size), fit_scale(logo, size, FULL_BLEED_FIT)))

    return {
        'icon-32.png': centred(logo, clear(32), fit_scale(logo, 32, 1)),
        'icon-192.png': full_bleed(192),
        'icon-512.png': full_bleed(512),
        'icon-maskable-512.png': few_colours(centred(logo, sky(512), safe_scale(logo, 512))),
        'apple-touch-icon.png': full_bleed(180),
    }


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else OUT_DIR
    os.makedirs(out_dir, exist_ok=True)
    logo = key_out_magenta(Image.open(SOURCE).convert('RGB'))
    for name, image in icons(logo).items():
        image.save(os.path.join(out_dir, name), optimize=True)
        print(f'{name} {image.width}x{image.height}')


if __name__ == '__main__':
    main()
