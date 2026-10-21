#!/usr/bin/env python3
"""Sheets for checking a hero's card loops frame by frame, pixel by pixel.

    python3 tools/hero_cards/preview.py bokator OUT_DIR
    python3 tools/hero_cards/preview.py angkor OUT_DIR --zoom 12

For each of the hero's two loops (`card_pose.png`, `card_idle.png`) it writes:
  <hero>_<loop>_grid.png   every frame x10 on a pixel grid, the loop's last frame again at the end
  <hero>_<loop>_moves.png  the same frames with each pixel that changed since the frame before
                           ringed in magenta, the first frame against the last (the loop's seam)
  <hero>_<loop>.gif        the loop playing at the card's speed, x4
Nothing is written to the game's assets.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hero_cards.sheet import FW, frames_in, hero_file  # noqa: E402

BACK = (40, 40, 52, 255)
LINE, MAJOR, MOVED = (62, 62, 78, 255), (112, 112, 140, 255), (255, 0, 255, 255)
LOOPS = ('card_pose.png', 'card_idle.png')


def figure_box(frames, margin=3):
    solid = np.any([frame[..., 3] > 0 for frame in frames], axis=0)
    ys, xs = np.nonzero(solid)
    return (max(0, xs.min() - margin), max(0, ys.min() - margin),
            min(FW, xs.max() + 1 + margin), min(frames[0].shape[0], ys.max() + 1 + margin))


def zoomed(frame, box, zoom, changed=None):
    x0, y0, x1, y1 = box
    crop = Image.fromarray(frame[y0:y1, x0:x1])
    back = Image.new('RGBA', crop.size, BACK)
    back.alpha_composite(crop)
    big = back.resize((crop.width * zoom, crop.height * zoom), Image.NEAREST)
    draw = ImageDraw.Draw(big)
    for i in range(crop.width + 1):
        draw.line([(i * zoom, 0), (i * zoom, big.height)], fill=MAJOR if (x0 + i) % 8 == 0 else LINE)
    for j in range(crop.height + 1):
        draw.line([(0, j * zoom), (big.width, j * zoom)], fill=MAJOR if (y0 + j) % 8 == 0 else LINE)
    if changed is not None:
        for y, x in zip(*np.nonzero(changed[y0:y1, x0:x1])):
            box = [x * zoom + 1, y * zoom + 1, (x + 1) * zoom - 1, (y + 1) * zoom - 1]
            draw.rectangle(box, outline=MOVED)
    return big


def row_sheet(tiles, gap=12):
    width = sum(tile.width for tile in tiles) + gap * (len(tiles) - 1)
    out = Image.new('RGBA', (width, tiles[0].height), (0, 0, 0, 255))
    x = 0
    for tile in tiles:
        out.paste(tile, (x, 0))
        x += tile.width + gap
    return out


def changes(frames):
    return [(frames[i] != frames[i - 1]).any(-1) for i in range(len(frames))]


def gif(frames, path, zoom=4, duration=150):
    shots = []
    for frame in frames:
        back = Image.new('RGBA', (frame.shape[1], frame.shape[0]), BACK)
        back.alpha_composite(Image.fromarray(frame))
        shots.append(back.resize((frame.shape[1] * zoom, frame.shape[0] * zoom), Image.NEAREST).convert('P'))
    shots[0].save(path, save_all=True, append_images=shots[1:], duration=duration, loop=0)


def main(hero, out_dir, zoom=10):
    os.makedirs(out_dir, exist_ok=True)
    for loop in LOOPS:
        frames = frames_in(hero_file(hero, loop))
        box = figure_box(frames)
        name = os.path.join(out_dir, f'{hero}_{loop[:-4]}')
        row_sheet([zoomed(frame, box, zoom) for frame in frames + frames[:1]]).save(f'{name}_grid.png')
        moved = changes(frames)
        marked = [zoomed(frame, box, zoom, change) for frame, change in zip(frames, moved)]
        row_sheet(marked).save(f'{name}_moves.png')
        gif(frames, f'{name}.gif')
        print('wrote', name + '_*.png')


if __name__ == '__main__':
    args = sys.argv[1:]
    zoom = int(args[args.index('--zoom') + 1]) if '--zoom' in args else 10
    main(args[0], args[1], zoom)
