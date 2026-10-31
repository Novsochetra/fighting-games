#!/usr/bin/env python3
"""Redraw a boss's grid sheet finer, so drawn at its own scale each pixel is one screen pixel.

    python3 tools/boss_redraw/refine.py ox 1.95 OLD.png NEW.png

A boss is drawn at its own scale from a sheet drawn for scale 1, so each of its pixels showed
nearly two screen pixels wide beside a hero's one. This draws every frame `density` times as
fine, in the sheet's own palette: each old pixel is blown up into a block, the blocks' stairs
are rounded off by giving each spot the colour most of the spots round it have (so a curve steps
one fine pixel at a time instead of a whole block, and every flat cluster stays flat), and the
result is brought down to the new size by the colour that covers most of each fine pixel. A lone
pixel left unlike all eight round it takes their commonest colour, and the outline, doubled by
the blow-up, is thinned back to one pixel.

Run it on the sheet drawn for scale 1: the new cells are the old ones times `density`, rounded,
with the feet where the old feet land, and src/data/enemies/enemy-sprites.js then needs the new
frame size, feet and `density`. Then run tools/pack_enemy_sheets.py.
"""
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GAME = os.path.join(ROOT, 'apps', 'web', 'games', 'steel-and-dust')
# each old pixel is blown up this many times over before its stairs are rounded off
BLOW_UP = 10
# a window half again as wide as a block rounds a cluster's corners into curves; wider, it starts
# to swallow a lone pixel of light, an eye or a glint
ROUNDING = 15
PAD = 2
# a colour this dark counts as the outline's ink
INK = 90
FOUR = [(1, 0), (-1, 0), (0, 1), (0, -1)]

READ_SPRITE = """
const { ENEMY_SPRITES } = await import(process.argv[1]);
console.log(JSON.stringify(ENEMY_SPRITES[process.argv[2]]));
"""


def read_sprite(sprite_id):
    table = os.path.join(GAME, 'src', 'data', 'enemies', 'enemy-sprites.js')
    output = subprocess.run(
        ['node', '--input-type=module', '-e', READ_SPRITE, '--', 'file://' + table, sprite_id],
        check=True, capture_output=True, text=True,
    ).stdout
    return json.loads(output)


def new_frame(sprite, density):
    width, height = round(sprite['frameWidth'] * density), round(sprite['frameHeight'] * density)
    feet_x, feet_y = round(sprite['feetX'] * density), round(sprite['feetY'] * density)
    return width, height, feet_x, feet_y


def rounded(cell, clear):
    big = np.kron(cell, np.ones((BLOW_UP, BLOW_UP), np.uint8))
    filtered = Image.fromarray(big, 'L').filter(ImageFilter.ModeFilter(ROUNDING))
    return np.array(filtered), big != clear


# each fine pixel takes the colour that covers most of it, or stays clear where clear covers most
def brought_down(index, solid, clear, size):
    width, height = size
    rows = np.round(np.arange(height + 1) * index.shape[0] / height).astype(int)
    cols = np.round(np.arange(width + 1) * index.shape[1] / width).astype(int)
    out = np.full((height, width), clear, np.uint8)
    for y in range(height):
        for x in range(width):
            block = index[rows[y]:rows[y + 1], cols[x]:cols[x + 1]].ravel()
            painted = block[block != clear]
            if painted.size * 2 > block.size:
                out[y, x] = np.bincount(painted).argmax()
            elif painted.size * 2 == block.size and solid[rows[y]:rows[y + 1], cols[x]:cols[x + 1]].all():
                out[y, x] = np.bincount(painted).argmax()
    return out


def despeckled(frame, clear):
    out = frame.copy()
    height, width = frame.shape
    for y in range(1, height - 1):
        for x in range(1, width - 1):
            around = frame[y - 1:y + 2, x - 1:x + 2].ravel()
            others = np.delete(around, 4)
            if around[4] == clear or (others == clear).any() or (others == around[4]).any():
                continue
            out[y, x] = np.bincount(others).argmax()
    return out


def touching(mask):
    padded = np.pad(mask, 1)
    return padded[:-2, 1:-1] | padded[2:, 1:-1] | padded[1:-1, :-2] | padded[1:-1, 2:]


# the old one-pixel outline comes out two fine pixels thick: its inner pixel takes the colour inside
# it, so the outline is one screen pixel, as the heroes' is, where a dark body does not go on in
def thinned(frame, clear, ink):
    solid = frame != clear
    edge = solid & touching(~solid)
    second = solid & ~edge & touching(edge)
    deep = solid & ~edge & ~second
    out = frame.copy()
    for y, x in zip(*np.nonzero(second & ink[frame])):
        inner = [frame[y + dy, x + dx] for dy, dx in FOUR
                 if deep[y + dy, x + dx] and not ink[frame[y + dy, x + dx]]]
        if inner:
            out[y, x] = np.bincount(inner).argmax()
    return out


# the painted box of an old cell, refined and set into a new cell where its old place lands
def refine_cell(cell, clear, ink, density, new_size):
    ys, xs = np.nonzero(cell != clear)
    if ys.size == 0:
        return np.full(new_size[::-1], clear, np.uint8)
    top, left = max(0, ys.min() - PAD), max(0, xs.min() - PAD)
    bottom, right = min(cell.shape[0], ys.max() + 1 + PAD), min(cell.shape[1], xs.max() + 1 + PAD)
    index, solid = rounded(cell[top:bottom, left:right], clear)
    new_top, new_left = round(top * density), round(left * density)
    size = (round(right * density) - new_left, round(bottom * density) - new_top)
    piece = despeckled(brought_down(index, solid, clear, size), clear)
    piece = thinned(np.pad(piece, 1, constant_values=clear), clear, ink)[1:-1, 1:-1]
    out = np.full(new_size[::-1], clear, np.uint8)
    out[new_top:new_top + piece.shape[0], new_left:new_left + piece.shape[1]] = piece
    return out


def refine(sprite_id, density, old_path, new_path):
    sprite = read_sprite(sprite_id)
    sheet = Image.open(old_path)
    clear = sheet.info['transparency']
    ink = np.array(sheet.getpalette()).reshape(-1, 3).sum(1) < INK
    cells = np.array(sheet)
    width, height, feet_x, feet_y = new_frame(sprite, density)
    old_width, old_height = sprite['frameWidth'], sprite['frameHeight']
    rows, columns = sheet.height // old_height, sheet.width // old_width
    out = np.full((rows * height, columns * width), clear, np.uint8)
    for row in range(rows):
        for column in range(columns):
            cell = cells[row * old_height:(row + 1) * old_height, column * old_width:(column + 1) * old_width]
            out[row * height:(row + 1) * height, column * width:(column + 1) * width] = refine_cell(
                cell, clear, ink, density, (width, height))
        print(f'row {row} done')
    image = Image.fromarray(out, 'P')
    image.putpalette(sheet.getpalette())
    image.save(new_path, transparency=clear, optimize=True)
    print(f'frameWidth: {width}, frameHeight: {height}, feetX: {feet_x}, feetY: {feet_y}, density: {density}')


if __name__ == '__main__':
    refine(sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4])
