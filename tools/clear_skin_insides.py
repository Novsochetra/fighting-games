#!/usr/bin/env python3
"""The insides seen through the Clear skins' see-through shells: a circuit board, our own.

    python3 tools/clear_skin_insides.py [OUT_FILE]

Writes apps/web/games/steel-and-dust/assets/skins/clear/insides.svg (or OUT_FILE): a square board,
which the skin covers the screen with and crops to the phone's shape, so it is drawn to be seen in
any part. It is drawn in white and black at low opacity only: the skin's tinted plastic, laid over
it in CSS, gives it each shell's colour. The layout comes from a fixed seed, so it draws the same
board every time.
"""
import math
import os
import random
import sys

SIZE = 1600
SEED = 7
LIGHT = '#ffffff'
DARK = '#000000'


def rect(x, y, width, height, fill, opacity, radius=0, stroke=None):
    outline = f' stroke="{stroke}" stroke-opacity="0.35" stroke-width="3"' if stroke else ''
    return (
        f'<rect x="{x:.0f}" y="{y:.0f}" width="{width:.0f}" height="{height:.0f}" rx="{radius}" '
        f'fill="{fill}" fill-opacity="{opacity}"{outline}/>'
    )


def circle(x, y, radius, fill, opacity, stroke=None, width=3):
    outline = f' stroke="{stroke}" stroke-opacity="0.4" stroke-width="{width}"' if stroke else ''
    return f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{radius}" fill="{fill}" fill-opacity="{opacity}"{outline}/>'


def chip(x, y, width, height, pins):
    """A chip in its package, with a row of pins along each side."""
    parts = [rect(x, y, width, height, DARK, 0.32, 6, LIGHT)]
    for i in range(pins):
        along = (i + 0.5) / pins
        parts.append(rect(x + along * width - 4, y - 14, 8, 12, LIGHT, 0.45))
        parts.append(rect(x + along * width - 4, y + height + 2, 8, 12, LIGHT, 0.45))
        parts.append(rect(x - 14, y + along * height - 4, 12, 8, LIGHT, 0.45))
        parts.append(rect(x + width + 2, y + along * height - 4, 12, 8, LIGHT, 0.45))
    parts.append(circle(x + 18, y + 18, 6, LIGHT, 0.4))
    return parts


def screw(x, y):
    """A screw in its boss: a ring, the head and its cross."""
    return [
        circle(x, y, 30, DARK, 0.18, LIGHT, 3),
        circle(x, y, 16, LIGHT, 0.28),
        f'<path d="M{x - 9} {y}h18M{x} {y - 9}v18" stroke="{DARK}" stroke-opacity="0.45" stroke-width="4"/>',
    ]


def trace(rng, x, y):
    """A copper trace leaving a pin, turning at 45 degrees, ending in a via."""
    points = [(x, y)]
    heading = rng.choice([0, 90, 180, 270])
    for _ in range(rng.randint(2, 4)):
        length = rng.randint(40, 180)
        x += math.cos(math.radians(heading)) * length
        y += math.sin(math.radians(heading)) * length
        points.append((x, y))
        heading += rng.choice([-45, 45])
    path = ' '.join(f'{px:.0f},{py:.0f}' for px, py in points)
    return [
        f'<polyline points="{path}" fill="none" stroke="{LIGHT}" stroke-opacity="0.32" '
        'stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>',
        circle(x, y, 8, DARK, 0.3, LIGHT, 3),
    ]


def speaker(x, y, columns, rows):
    return [
        circle(x + column * 26, y + row * 26 + (column % 2) * 13, 7, DARK, 0.4)
        for column in range(columns)
        for row in range(rows)
    ]


def battery(x, y, width, height):
    return [
        rect(x, y, width, height, LIGHT, 0.06, 26, LIGHT),
        rect(x + 24, y + 24, width - 48, height - 48, DARK, 0.12, 16),
        f'<path d="M{x + width / 2 - 20} {y + height / 2}h40M{x + width / 2} {y + height / 2 - 20}v40" '
        f'stroke="{LIGHT}" stroke-opacity="0.35" stroke-width="6"/>',
    ]


def ribbon(x, y, length, wires):
    return [
        rect(x, y + i * 12, length, 6, LIGHT, 0.16 + 0.06 * (i % 2), 3)
        for i in range(wires)
    ]


def board():
    rng = random.Random(SEED)
    parts = [rect(70, 70, SIZE - 140, SIZE - 140, LIGHT, 0.03, 60, LIGHT)]
    chips = [(640, 620, 300, 300, 9), (300, 340, 170, 120, 5), (1080, 1020, 200, 150, 6),
             (1120, 360, 150, 150, 4), (360, 1110, 140, 100, 4)]
    for x, y, width, height, pins in chips:
        for i in range(pins):
            along = (i + 0.5) / pins
            parts += trace(rng, x + along * width, y + height + 14)
            parts += trace(rng, x + width + 14, y + along * height)
        parts += chip(x, y, width, height, pins)
    for x, y in [(160, 160), (SIZE - 160, 160), (160, SIZE - 160), (SIZE - 160, SIZE - 160),
                 (SIZE / 2, 230), (SIZE / 2, SIZE - 230)]:
        parts += screw(x, y)
    for _ in range(26):
        x, y = rng.randint(180, SIZE - 180), rng.randint(180, SIZE - 180)
        parts.append(rect(x, y, 34, 16, LIGHT, 0.3, 4))
    for _ in range(8):
        x, y = rng.randint(200, SIZE - 200), rng.randint(200, SIZE - 200)
        parts.append(circle(x, y, 22, DARK, 0.25, LIGHT, 3))
    parts += battery(1020, 560, 380, 300)
    parts += speaker(200, 1240, 9, 6)
    parts += ribbon(560, 1380, 420, 8)
    return parts


def main():
    default = os.path.join(os.path.dirname(__file__), '..', 'apps', 'web', 'games', 'steel-and-dust',
                           'assets', 'skins', 'clear', 'insides.svg')
    out = sys.argv[1] if len(sys.argv) > 1 else default
    os.makedirs(os.path.dirname(out), exist_ok=True)
    body = '\n'.join(board())
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" '
           f'width="{SIZE}" height="{SIZE}">\n{body}\n</svg>\n')
    with open(out, 'w', encoding='utf-8') as file:
        file.write(svg)
    print(f'{out}: {len(svg)} bytes')


if __name__ == '__main__':
    main()
