#!/usr/bin/env python3
"""Lay a boss's new strips under the rows its sheet already has, in the sheet's own palette.

    python3 tools/boss_art/append_strips.py tools/boss_art/specs/khan.json

The spec's `sheet` names the boss's indexed PNG (`base`), how many of its rows were drawn before
any strip was added (`baseRows`, so the script can run again on its own output), the file to write
(`out`) and the cleaned strips (`rows`), top to bottom, each one frame high. The sheet
widens to the longest row. The new rows are reduced to 64 colors, and each of those that lies close
to a color the sheet already has takes that color, so the new frames share the old frames' ramps;
the rest join the palette.
"""
import json
import sys

import numpy as np
from PIL import Image

NEAR = 20


def append(spec):
    sheet_file = Image.open(spec['base'])
    base = sheet_file.crop((0, 0, sheet_file.width, spec['baseRows'] * spec['frameHeight']))
    used = max(index for _, index in base.getcolors(256)) + 1
    palette = np.array(base.getpalette()[: 3 * used]).reshape(-1, 3)
    rows = [Image.open(path).convert('RGBA') for path in spec['rows']]
    frame_height = spec['frameHeight']
    width = max([base.width] + [row.width for row in rows])
    height = base.height + frame_height * len(rows)
    sheet = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    for i, row in enumerate(rows):
        sheet.alpha_composite(row, (0, base.height + frame_height * i))
    added = np.array(sheet)[base.height :]
    opaque = added[:, :, 3] > 0
    colors = added[opaque][:, :3].reshape(1, -1, 3).astype(np.uint8)
    reduced = Image.fromarray(colors).quantize(64, method=Image.Quantize.MEDIANCUT)
    reduced_palette = np.array(reduced.getpalette()[: 64 * 3]).reshape(-1, 3)
    entries = [tuple(color) for color in palette]
    index_of = {}
    for i, color in enumerate(reduced_palette):
        distance = ((palette[1:] - color) ** 2).sum(1)
        nearest = int(np.argmin(distance))
        if distance[nearest] <= NEAR**2:
            index_of[i] = nearest + 1
        else:
            entries.append(tuple(int(value) for value in color))
            index_of[i] = len(entries) - 1
    indexed = np.zeros((height, width), dtype=np.uint8)
    indexed[: base.height, : base.width] = np.array(base)
    lower = np.zeros(added.shape[:2], dtype=np.uint8)
    lower[opaque] = np.vectorize(index_of.get)(np.array(reduced).reshape(-1))
    indexed[base.height :] = lower
    out = Image.fromarray(indexed, 'P')
    flat = [value for color in entries for value in color]
    out.putpalette(flat + [0] * (768 - len(flat)))
    out.save(spec['out'], transparency=0, optimize=True)
    print('wrote', spec['out'], out.size, len(entries) - len(palette), 'new colors')


if __name__ == '__main__':
    append(json.load(open(sys.argv[1]))['sheet'])
