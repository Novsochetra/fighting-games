#!/usr/bin/env python3
"""Lay the pitch sprites' poses out as the sheets ChatGPT redraws (concepts/naga-eleven/pitch-trial/).

    python3 tools/pitch_trial/pose_sheets.py    writes concepts/naga-eleven/pitch-trial/chatgpt/

Each sheet is a few frames of the game's own sprites, 64×62 each, scaled on a pixel grid on
magenta, in the cells ChatGPT is asked to fill: it redraws every pose in the new style, at the
same size, and the frames are read back from those cells.
"""
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SPRITES = os.path.join(ROOT, 'apps/web/games/naga-eleven/assets/sprites')
OUT = os.path.join(ROOT, 'concepts/naga-eleven/pitch-trial/chatgpt')
WIDTH, HEIGHT = 64, 62
SCALE = 6
GAP = 12
HEAD_ROW, SOLE_ROW, MIDDLE = 3, 60, 32
MAGENTA, GRID, GUIDE, CENTRE, BORDER = (255, 0, 255), (200, 0, 200), (0, 200, 0), (0, 200, 255), (40, 40, 40)
ROW_OF = {'south': 0, 'south-east': 1, 'east': 2, 'north-east': 3, 'north': 4}

# (sheet, animation, columns, [(direction, frame), ...]) in the order the cells are read
SHEETS = [
    ('idle', 'idle', 3, [(d, 0) for d in ('south', 'south-east', 'east', 'north-east', 'north')]),
    *[(f'run-{d}', 'run', 3, [(d, i) for i in range(6)]) for d in ROW_OF],
    ('kick-south-southeast', 'kick', 3, [(d, i) for d in ('south', 'south-east') for i in range(3)]),
    ('kick-east-northeast', 'kick', 3, [(d, i) for d in ('east', 'north-east') for i in range(3)]),
    ('slide-south-southeast', 'slide', 3, [(d, i) for d in ('south', 'south-east') for i in range(3)]),
    ('slide-east-northeast', 'slide', 3, [(d, i) for d in ('east', 'north-east') for i in range(3)]),
    ('slide-north', 'slide', 3, [('north', i) for i in range(3)]),
    *[(f'fall-{d}', 'fall', 2, [(d, i) for i in range(4)]) for d in ROW_OF],
    ('dive-east-1', 'dive', 2, [('east', i) for i in range(4)]),
    ('dive-east-2', 'dive', 2, [('east', i) for i in range(4, 8)]),
    ('celebrate-1', 'celebrate', 2, [('south', i) for i in range(4)]),
    ('celebrate-2', 'celebrate', 2, [('south', i) for i in range(4, 8)]),
]
# the dive and the celebration are drawn in one direction, on the sheet's first row
SINGLE_ROW = {'dive', 'celebrate'}


def paint_cell(sheet, left, top):
    draw = ImageDraw.Draw(sheet)
    width, height = WIDTH * SCALE, HEIGHT * SCALE
    draw.rectangle((left, top, left + width - 1, top + height - 1), fill=MAGENTA)
    for i in range(WIDTH + 1):
        draw.line((left + i * SCALE, top, left + i * SCALE, top + height), fill=GRID)
    for j in range(HEIGHT + 1):
        draw.line((left, top + j * SCALE, left + width, top + j * SCALE), fill=GRID)
    draw.line((left, top + HEAD_ROW * SCALE, left + width, top + HEAD_ROW * SCALE), fill=GUIDE, width=2)
    sole = top + (SOLE_ROW + 1) * SCALE
    draw.line((left, sole, left + width, sole), fill=GUIDE, width=2)
    draw.line((left + MIDDLE * SCALE, top, left + MIDDLE * SCALE, top + height), fill=CENTRE, width=2)


def frame_of(sheet, animation, direction, index):
    row = 0 if animation in SINGLE_ROW else ROW_OF[direction]
    box = (index * WIDTH, row * HEIGHT, (index + 1) * WIDTH, (row + 1) * HEIGHT)
    return sheet.crop(box).resize((WIDTH * SCALE, HEIGHT * SCALE), Image.NEAREST)


def pose_sheet(animation, columns, cells, with_poses=True):
    rows = -(-len(cells) // columns)
    width, height = WIDTH * SCALE, HEIGHT * SCALE
    sheet = Image.new('RGB', (columns * width + (columns + 1) * GAP, rows * height + (rows + 1) * GAP), BORDER)
    source = Image.open(os.path.join(SPRITES, f'{animation}.png')).convert('RGBA')
    for i, (direction, index) in enumerate(cells):
        left = GAP + (i % columns) * (width + GAP)
        top = GAP + (i // columns) * (height + GAP)
        paint_cell(sheet, left, top)
        if with_poses:
            pose = frame_of(source, animation, direction, index)
            sheet.paste(pose, (left, top), pose)
    return sheet


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, animation, columns, cells in SHEETS:
        pose_sheet(animation, columns, cells).save(os.path.join(OUT, f'pose-{name}.png'))
    for columns, count in ((3, 6), (2, 4)):
        empty = pose_sheet('idle', columns, [('south', 0)] * count, with_poses=False)
        empty.save(os.path.join(OUT, f'empty-{columns}x{count // columns}.png'))
    print(f'wrote {len(SHEETS)} pose sheets and 2 empty grids into {OUT}')


if __name__ == '__main__':
    main()
