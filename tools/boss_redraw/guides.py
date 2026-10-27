#!/usr/bin/env python3
"""Draw the guides an image model redraws a boss's sheet from, finer, at the density it is shown at.

    python3 tools/boss_redraw/guides.py ox OUT_DIR

A boss is drawn at its own scale (1.5 to 2.25) from a sheet drawn for scale 1, so each of its pixels
shows nearly two screen pixels wide beside a hero's one. A sheet drawn `scale` times as fine, with
`density` set to match, shows it at the same size with one screen pixel per pixel, as the Naga
Raja's does.

`<id>_00_design.png` is the boss's idle stance, big and crisp, for the one master drawing every
other image follows. Each strip then gets a guide of its old frames on flat magenta, in a grid as
big as an image the model draws (1536x1024, 1024x1536 or 1024x1024) allows, every frame of an image
at one size with its feet on its row's line, so the model keeps the poses, the order and the size.
`layout.json` says where each frame's feet are in its guide, for cutting the drawings back up.
"""
import json
import math
import os
import subprocess
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GAME = os.path.join(ROOT, 'apps', 'web', 'games', 'steel-and-dust')
SHEETS = os.path.join(GAME, 'assets', 'sprites', 'enemies')
MAGENTA = (255, 0, 255, 255)
CANVASES = [(1536, 1024), (1024, 1536), (1024, 1024)]
# a figure keeps this share of its cell clear on each side, so the model's figures never touch
MARGIN = 0.07
# more frames than this in one image come out too small to redraw in detail
MOST_FRAMES = 9
DESIGN_HEIGHT = 0.8

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


def cell_of(sheet, sprite, row, frame):
    width, height = sprite['frameWidth'], sprite['frameHeight']
    return sheet.crop((frame * width, row * height, (frame + 1) * width, (row + 1) * height))


# the box round every frame of a strip, from its feet, so one placement fits them all
def strip_bounds(frames, sprite):
    boxes = [frame.getbbox() for frame in frames if frame.getbbox()]
    feet_x, feet_y = sprite['feetX'], sprite['feetY']
    return (min(box[0] for box in boxes) - feet_x, min(box[1] for box in boxes) - feet_y,
            max(box[2] for box in boxes) - feet_x, max(box[3] for box in boxes) - feet_y)


def grids_for(count):
    for columns in range(1, count + 1):
        rows = math.ceil(count / columns)
        if columns * (rows - 1) < count:
            yield columns, rows


# the canvas and grid that draw the strip's frames biggest
def best_layout(count, bounds):
    width, height = bounds[2] - bounds[0], bounds[3] - bounds[1]
    layouts = []
    for canvas in CANVASES:
        for columns, rows in grids_for(count):
            cell = (canvas[0] / columns, canvas[1] / rows)
            scale = min(cell[0] * (1 - 2 * MARGIN) / width, cell[1] * (1 - 2 * MARGIN) / height)
            layouts.append((scale, canvas, columns, rows))
    return max(layouts, key=lambda layout: layout[0])


def chunks_of(count):
    parts = math.ceil(count / MOST_FRAMES)
    size = math.ceil(count / parts)
    return [list(range(start, min(start + size, count))) for start in range(0, count, size)]


# soft, so the model takes the pose from it and not the old sheet's coarse pixel grid
def enlarged(frame, scale):
    whole = max(1, int(scale))
    coarse = frame.resize((frame.width * whole, frame.height * whole), Image.NEAREST)
    return coarse.resize((round(frame.width * scale), round(frame.height * scale)), Image.LANCZOS)


# where the feet go in a cell, so the strip's box round them sits in its middle
def feet_in_cell(cell_start, cell_length, low, high, scale):
    return cell_start + (cell_length - (high - low) * scale) / 2 - low * scale


def draw_guide(frames, sprite, bounds, layout):
    scale, canvas, columns, rows = layout
    cell_width, cell_height = canvas[0] / columns, canvas[1] / rows
    guide = Image.new('RGBA', canvas, MAGENTA)
    feet = []
    for place, frame in enumerate(frames):
        column, row = place % columns, place // columns
        feet_x = feet_in_cell(column * cell_width, cell_width, bounds[0], bounds[2], scale)
        feet_y = feet_in_cell(row * cell_height, cell_height, bounds[1], bounds[3], scale)
        corner = (round(feet_x - sprite['feetX'] * scale), round(feet_y - sprite['feetY'] * scale))
        guide.alpha_composite(enlarged(frame, scale), corner)
        feet.append([round(feet_x, 1), round(feet_y, 1)])

    return guide, feet


def draw_design(stance, size=(1024, 1024)):
    box = stance.getbbox()
    figure = stance.crop(box)
    scale = int(size[1] * DESIGN_HEIGHT / figure.height)
    big = figure.resize((figure.width * scale, figure.height * scale), Image.NEAREST)
    design = Image.new('RGBA', size, MAGENTA)
    design.alpha_composite(big, ((size[0] - big.width) // 2, (size[1] - big.height) // 2))
    return design


def strips_in_order(sprite):
    return sorted(sprite['strips'].items(), key=lambda entry: entry[1]['row'])


def write_guides(sprite_id, out_dir):
    sprite = read_sprite(sprite_id)
    sheet = Image.open(os.path.join(SHEETS, sprite['file'])).convert('RGBA')
    os.makedirs(out_dir, exist_ok=True)
    design = draw_design(cell_of(sheet, sprite, 0, 0))
    design.save(os.path.join(out_dir, f'{sprite_id}_00_design.png'))
    guides = []
    for number, (name, strip) in enumerate(strips_in_order(sprite), start=1):
        frames = [cell_of(sheet, sprite, strip['row'], index) for index in range(strip['frames'])]
        bounds = strip_bounds(frames, sprite)
        parts = chunks_of(len(frames))
        for part, indices in enumerate(parts):
            layout = best_layout(len(indices), bounds)
            guide, feet = draw_guide([frames[index] for index in indices], sprite, bounds, layout)
            suffix = 'ab'[part] if len(parts) > 1 else ''
            file = f'{sprite_id}_{number:02d}{suffix}_{name}_guide.png'
            guide.save(os.path.join(out_dir, file))
            scale, canvas, columns, rows = layout
            guides.append({'file': file, 'strip': name, 'frames': indices, 'canvas': canvas,
                           'columns': columns, 'rows': rows, 'scale': round(scale, 3), 'feet': feet})
            print(f'{file:40s} {len(indices):2d} frames, {columns}x{rows} on '
                  f'{canvas[0]}x{canvas[1]}, old pixel = {scale:.2f} px')

    with open(os.path.join(out_dir, 'layout.json'), 'w') as out:
        json.dump({'sprite': sprite_id, 'guides': guides}, out, indent=1)


if __name__ == '__main__':
    write_guides(sys.argv[1], sys.argv[2])
