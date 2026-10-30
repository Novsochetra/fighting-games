#!/usr/bin/env python3
"""The arcade's logo and app icons: a white joystick on a warm gradient.

    python3 tools/arcade_icons.py [OUT_DIR]

Writes every size the home page and its manifest name to apps/web/arcade/public/assets/icons/ (or OUT_DIR):
  icon-32.png, icon-192.png, icon-512.png  rounded squares, for tabs, desktops and the top bar
  icon-maskable-512.png                    full bleed, the joystick inside Android's safe circle
  apple-touch-icon.png                     180 x 180 full bleed; iOS rounds the corners itself
Shapes are drawn on a canvas eight times bigger and shrunk, which smooths their edges.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

SUPERSAMPLE = 8
CORNER_RADIUS = 0.225
GRADIENT_FROM, GRADIENT_TO = (255, 159, 10), (255, 55, 95)
GLYPH = (255, 255, 255, 255)

# In a unit square: the ball, the stick under it and the base it stands in.
BALL_CENTER, BALL_RADIUS = (0.5, 0.35), 0.145
STICK = (0.46, 0.4, 0.54, 0.7)
BASE = (0.26, 0.655, 0.74, 0.785)


def gradient(size):
    # Top left to bottom right, as the light falls on Apple's own icons.
    ys, xs = np.mgrid[0:size, 0:size] / max(size - 1, 1)
    share = ((xs + ys) / 2)[..., None]
    start, end = np.array(GRADIENT_FROM), np.array(GRADIENT_TO)
    rgb = start + (end - start) * share
    alpha = np.full((size, size, 1), 255)
    return np.concatenate([rgb, alpha], axis=2).round().astype(np.uint8)


def to_pixels(box, size, scale):
    return [size * (0.5 + (value - 0.5) * scale) for value in box]


def draw_joystick(image, scale):
    size = image.width
    draw = ImageDraw.Draw(image)
    base = to_pixels(BASE, size, scale)
    draw.rounded_rectangle(base, radius=(base[3] - base[1]) / 2, fill=GLYPH)
    stick = to_pixels(STICK, size, scale)
    draw.rounded_rectangle(stick, radius=(stick[2] - stick[0]) / 2, fill=GLYPH)
    cx, cy = to_pixels(BALL_CENTER, size, scale)
    radius = BALL_RADIUS * size * scale
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=GLYPH)


def corner_mask(size):
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=size * CORNER_RADIUS, fill=255)
    return mask


def render(size, *, rounded, glyph_scale=1.0):
    big = size * SUPERSAMPLE
    image = Image.fromarray(gradient(big))
    draw_joystick(image, glyph_scale)
    if rounded:
        image.putalpha(corner_mask(big))
    return image.resize((size, size), Image.LANCZOS)


def icons():
    return {
        'icon-32.png': render(32, rounded=True),
        'icon-192.png': render(192, rounded=True),
        'icon-512.png': render(512, rounded=True),
        'icon-maskable-512.png': render(512, rounded=False, glyph_scale=0.8),
        'apple-touch-icon.png': render(180, rounded=False),
    }


def main():
    repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(repo, 'apps', 'web', 'arcade', 'public', 'assets', 'icons')
    os.makedirs(out_dir, exist_ok=True)
    for name, image in icons().items():
        image.save(os.path.join(out_dir, name), optimize=True)
        print(f'{name} {image.width}x{image.height}')


if __name__ == '__main__':
    main()
