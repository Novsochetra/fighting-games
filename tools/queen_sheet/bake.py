"""Bake the Scorpion Queen's sheet and her swarm's wasp from the ChatGPT images.

    python3 tools/queen_sheet/bake.py
    python3 tools/pack_enemy_sheets.py

The images are in concepts/enemies/scorpion-queen/chatgpt/, made from the prompts in
concepts/enemies/scorpion-queen/chatgpt-prompts.md: her design, one grid of poses per strip and the
wasp, on flat cyan. Each pose is cut off the cyan, shrunk so the strip's stance stands as tall as her
idle, stood on the feet line and lined up by her planted rear legs (lay_out.py); her loops are held
still (loops.py); the sheet is folded into one palette of flat clusters with a dark outline
(pixel_art.py). It writes assets/sprites/enemies/queen.png and assets/sprites/fx/wasp.png in the
game; pack the enemy sheets again after.
"""

import os
import sys

import numpy as np
from PIL import Image

from lay_out import FRAME_HEIGHT, FRAME_WIDTH, STRIPS, laid_out_rows
from loops import LOOPS, steadied
from pixel_art import finished, speckle, without_strays
from wasp import wasp_strip

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SOURCE = os.path.join(ROOT, 'concepts', 'enemies', 'scorpion-queen', 'chatgpt')
SPRITES = os.path.join(ROOT, 'apps', 'web', 'games', 'steel-and-dust', 'assets', 'sprites')
COLORS = 84


def indexed_sheet(rows, done, rgb_palette):
    # index 0 is the clear pixel, as in every enemy sheet
    used = sorted({int(value) for indices, alpha in done for value in np.unique(indices[alpha])})
    remap = np.zeros(len(rgb_palette), np.uint8)
    remap[used] = np.arange(1, len(used) + 1)
    sheet = np.zeros((FRAME_HEIGHT * len(rows), FRAME_WIDTH * max(len(row) for row in rows)), np.uint8)
    frames = iter(done)
    for row_index, row in enumerate(rows):
        for column in range(len(row)):
            indices, alpha = next(frames)
            sheet[FRAME_HEIGHT * row_index:FRAME_HEIGHT * (row_index + 1),
                  FRAME_WIDTH * column:FRAME_WIDTH * (column + 1)] = np.where(alpha, remap[indices], 0)
    image = Image.fromarray(sheet, 'P')
    palette = [0, 0, 0] + [int(value) for index in used for value in rgb_palette[index]]
    image.putpalette(palette + [0] * (768 - len(palette)))
    return image, len(used)


def held_loops(image):
    sheet = np.array(image)
    palette = np.array(image.getpalette()[:768], np.uint8).reshape(-1, 3)
    names = [name for name, *_ in STRIPS]
    for name, loop in LOOPS.items():
        row = names.index(name)
        band = sheet[FRAME_HEIGHT * row:FRAME_HEIGHT * (row + 1)]
        cells = [band[:, FRAME_WIDTH * c:FRAME_WIDTH * (c + 1)].copy() for c in range(loop['frames'])]
        for column, cell in enumerate(steadied(cells, loop, palette)):
            band[:, FRAME_WIDTH * column:FRAME_WIDTH * (column + 1)] = cell
    held = Image.fromarray(sheet, 'P')
    held.putpalette(image.getpalette())
    return held


def main():
    rows = laid_out_rows(SOURCE)
    frames = [(rgb, without_strays(alpha)) for row in rows for rgb, alpha in row]
    done, rgb_palette = finished(frames, COLORS)
    image, colors = indexed_sheet(rows, done, rgb_palette)
    held_loops(image).save(os.path.join(SPRITES, 'enemies', 'queen.png'), transparency=0, optimize=True)
    spread = np.mean([speckle(indices, alpha) for indices, alpha in done])
    print(f'queen.png: {colors} colors, {spread:.2f} of the pixels alone')
    strip, wasp_frames = wasp_strip(SOURCE)
    Image.fromarray(strip).save(os.path.join(SPRITES, 'fx', 'wasp.png'), optimize=True)
    spread = np.mean([speckle(indices, alpha) for indices, alpha in wasp_frames])
    print(f'wasp.png: {len(np.unique(strip[strip[..., 3] > 0][:, :3], axis=0))} colors, {spread:.2f} alone')


if __name__ == '__main__':
    sys.exit(main())
