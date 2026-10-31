#!/usr/bin/env python3
"""Steel & Dust's tab and app icons, made from its logo.

    python3 tools/steel_and_dust_icons.py [OUT_DIR]

Reads concepts/logo/steel-and-dust.webp (the logo drawn on magenta), keys the magenta out and writes
every size the game's page and manifest name to apps/web/games/steel-and-dust/assets/icons/ (or OUT_DIR):
  icon-32.png                  the logo alone on a see-through square, for the browser tab
  icon-192.png, icon-512.png   the logo before Angkor Wat at dusk, full bleed, for desktops and the arcade's leaderboard
  icon-maskable-512.png        the same, the logo inside Android's safe circle
  apple-touch-icon.png         180 x 180 full bleed; iOS rounds the corners itself
The dusk is the hero select's painting of Angkor Wat through the palms, a sun going down behind the
logo's towers, drawn a block of BLOCK icon pixels at a time like the game's own art.
"""
import os
import sys

import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(REPO, 'apps', 'web', 'games', 'steel-and-dust')
SOURCE = os.path.join(REPO, 'concepts', 'logo', 'steel-and-dust.webp')
OUT_DIR = os.path.join(GAME, 'assets', 'icons')
PAINTING = os.path.join(GAME, 'assets', 'ui', 'select', 'bg-portrait.png')

PAINTING_SQUARE = (0, 0, 216, 216)
# Its sunset is as bright as the logo's gold, which would sink into it.
PAINTING_SHADE = 0.72
BLOCK = 4
FULL_BLEED_FIT = 0.92
# Android crops a maskable icon to any shape inside the circle of 80% of its width.
SAFE_RADIUS = 0.4
FRINGE_PASSES = 4
TINT_REACH = 8
# The magenta has red and blue level, and so has any colour blended into it; the logo's pink clouds
# are far redder than blue.
LEVEL = 40

# Where the sun sits, in shares of the logo's box: on the logo's own sun, behind the middle tower.
SUN_IN_LOGO = (0.5, 0.3)
# Outermost first: radius in shares of the logo's width, colour, and how much of the dusk it covers.
SUN_GLOW = (
    (0.46, (224, 83, 61), 0.22),
    (0.38, (236, 120, 52), 0.3),
    (0.3, (242, 163, 58), 0.45),
    (0.23, (250, 190, 100), 0.85),
    (0.17, (255, 214, 140), 1.0),
)
RAYS, RAY_COLOUR, RAY_SHARE, RAY_STEPS = 12, (242, 163, 58), 0.16, 4


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
    # magenta blended into the logo's dark outline: red and blue both well above green and level
    spill = np.minimum(red, blue) - green
    fringe = (spill > 30) & (np.abs(red - blue) < LEVEL)
    for _ in range(FRINGE_PASSES):
        background |= fringe & neighbours_of(background)

    # the tinted outline the passes leave (pockets the magenta reached only through the art) goes
    # back to the dark it was drawn; further in, red beside blue (a flag on an armband) is the art's own
    near = background
    for _ in range(TINT_REACH):
        near = neighbours_of(near)

    untinted = np.where(fringe & near, spill, 0)
    rgb = np.stack([red - untinted, green, blue - untinted], axis=2).astype(np.uint8)
    alpha = np.where(background, 0, 255).astype(np.uint8)
    logo = Image.fromarray(np.dstack([rgb, alpha]), 'RGBA')

    return logo.crop(logo.getbbox())


def shrink(logo, scale):
    # Shrunk premultiplied, so the magenta-free edge pixels blend into nothing rather than black.
    size = (round(logo.width * scale), round(logo.height * scale))
    return logo.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')


def tinted(pixels, colour, share):
    return pixels + share[..., None] * (np.array(colour, dtype=float) - pixels)


def block_grid(cells, sun):
    ys, xs = np.mgrid[0:cells, 0:cells] + 0.5
    return xs - sun[0], ys - sun[1]


def sun_rays(pixels, sun):
    across, down = block_grid(len(pixels), sun)
    lit = np.floor((np.arctan2(down, across) + np.pi) / np.pi * RAYS) % 2 == 0
    fade = np.clip(1 - np.hypot(across, down) / (len(pixels) * 0.8), 0, 1)

    return tinted(pixels, RAY_COLOUR, lit * np.floor(fade * RAY_STEPS) / RAY_STEPS * RAY_SHARE)


def sun_glow(pixels, sun, logo_width):
    distance = np.hypot(*block_grid(len(pixels), sun))
    for radius, colour, share in SUN_GLOW:
        pixels = tinted(pixels, colour, (distance <= radius * logo_width) * share)

    return pixels


def dusk(size, logo_box):
    cells = size // BLOCK
    left, top, width, height = (value / BLOCK for value in logo_box)
    sun = (left + SUN_IN_LOGO[0] * width, top + SUN_IN_LOGO[1] * height)
    painting = Image.open(PAINTING).convert('RGB').crop(PAINTING_SQUARE).resize((cells, cells), Image.BOX)
    shaded = np.asarray(painting, dtype=float) * PAINTING_SHADE
    pixels = sun_glow(sun_rays(shaded, sun), sun, width)

    return Image.fromarray(pixels.round().astype(np.uint8)).resize((size, size), Image.NEAREST).convert('RGBA')


def placed(logo, size, scale):
    art = shrink(logo, scale)
    return art, ((size - art.width) // 2, (size - art.height) // 2)


def on_clear(logo, size):
    art, spot = placed(logo, size, fit_scale(logo, size, 1))
    backdrop = Image.new('RGBA', (size, size))
    backdrop.alpha_composite(art, spot)

    return backdrop


def on_dusk(logo, size, scale):
    art, spot = placed(logo, size, scale)
    backdrop = dusk(size, (*spot, art.width, art.height))
    backdrop.alpha_composite(art, spot)

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
    # The smaller sizes are the 512 shrunk, so each is the same picture rather than a dusk of finer blocks.
    full_bleed = on_dusk(logo, 512, fit_scale(logo, 512, FULL_BLEED_FIT))
    shrunk = lambda size: few_colours(full_bleed.resize((size, size), Image.LANCZOS))

    return {
        'icon-32.png': on_clear(logo, 32),
        'icon-192.png': shrunk(192),
        'icon-512.png': few_colours(full_bleed),
        'icon-maskable-512.png': few_colours(on_dusk(logo, 512, safe_scale(logo, 512))),
        'apple-touch-icon.png': shrunk(180),
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
