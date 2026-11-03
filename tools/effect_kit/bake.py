#!/usr/bin/env python3
"""Bake Naga Eleven's effect kit from ChatGPT's sheets (concepts/naga-eleven/effect-kit/README.md).

    python3 tools/effect_kit/bake.py    writes apps/web/games/naga-eleven/src/art/effect-kit/

Each sheet is six frames of one effect, three across and two down, painted in key colours: its
main shape in greys, its trim in bright green, its core in bright blue. Each pixel becomes a code
of the pitch's effects (src/render/effects/maps.js): `o` the outline, `d m l h` the greys dark to
light, `y g G` the greens, `r e E` the blues, which a move's look colours as it draws.
"""
import os
import sys
from statistics import median

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(os.path.dirname(HERE), 'face_kit'))
sys.path.insert(0, os.path.dirname(HERE))
sys.path.insert(0, HERE)

from PIL import Image  # noqa: E402

from bake_magenta_sheet import art_mask, bounds  # noqa: E402
from cells import cut, despecked, read_cell  # noqa: E402
from encode import encode, module  # noqa: E402
from codes import codes_of  # noqa: E402

SOURCE = os.path.join(ROOT, 'concepts/naga-eleven/effect-kit/chatgpt')
OUT = os.path.join(ROOT, 'apps/web/games/naga-eleven/src/art/effect-kit.js')

# each sheet's block size, and where its frames are held: a trail by its head (its right end, where
# the ball is), an aura by the feet it stands round, an impact by its middle
EFFECTS = {
    'comet': (11.0, 'head'),
    'spiral': (8.0, 'head'),
    'helix': (6.3, 'head'),
    'ribbon': (6.2, 'head'),
    'motes': (6.3, 'feet'),
    'blaze': (6.6, 'feet'),
    'star': (6.2, 'middle'),
    'shock': (6.2, 'middle'),
}

HEADER = ('// baked by tools/effect_kit/bake.py from concepts/naga-eleven/effect-kit/; change the sheets\n'
          '// and bake again rather than edit these lines, which are pixels\n')


def frames_of(name, block):
    """Each frame's codes, placed in its cell: the cells of a sheet share one position."""
    sheet = Image.open(os.path.join(SOURCE, f'{name}.webp')).convert('RGB')
    frames = []
    for cell in cut(sheet):
        mask = art_mask(despecked(cell))
        left, top, _, _ = bounds(mask)
        codes = codes_of(read_cell(cell, block))
        dx, dy = round(left / block), round(top / block)
        frames.append({(x + dx, y + dy): code for (x, y), code in codes.items()})
    return frames


def anchor_of(frames, hold):
    points = [k for frame in frames for k in frame]
    if hold == 'head':
        right = max(x for x, _ in points)
        return right, median(y for x, y in points if x >= right - 3)
    xs, ys = [x for x, _ in points], [y for _, y in points]
    middle_x = (min(xs) + max(xs)) / 2
    return (middle_x, max(ys)) if hold == 'feet' else (middle_x, (min(ys) + max(ys)) / 2)


def main():
    parts = {}
    for name, (block, hold) in EFFECTS.items():
        frames = frames_of(name, block)
        anchor = anchor_of(frames, hold)
        for i, frame in enumerate(frames):
            parts[f'{name}-{i + 1}'] = encode(frame, anchor)
    with open(OUT, 'w') as out:
        out.write(module('EFFECT_FRAMES', parts, HEADER))
    print(f'baked {len(EFFECTS)} effects, {len(parts)} frames into {OUT}')


if __name__ == '__main__':
    main()
