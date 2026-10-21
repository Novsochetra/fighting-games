#!/usr/bin/env python3
"""Contact sheets of a Shade's strips before and after its effects, for checking frame by frame.

    python3 tools/shade_fx/preview.py moss OUT_DIR                  # every strip and the ultimate
    python3 tools/shade_fx/preview.py moss OUT_DIR idle win ult     # just these
    python3 tools/shade_fx/preview.py moss OUT_DIR --pixels idle:2  # one frame, big, on a pixel grid

A sheet shows the plain sword row, then the dressed sword, fists, spear and axe rows on the dark
backdrop, then the dressed sword row on a forest green and a desert sand backdrop. Nothing is
written to the game's assets; run tools/bake_hero_weapons.py for that.
"""
import os
import runpy
import sys
import numpy as np
from PIL import Image, ImageDraw

TOOLS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKDROPS = {'night': (40, 40, 52), 'forest': (58, 74, 46), 'sand': (201, 167, 116)}
FW = 128


def load_bake(hero):
    sys.argv = ['bake', hero]
    sys.path.insert(0, TOOLS)
    return runpy.run_path(os.path.join(TOOLS, 'bake_hero_weapons.py'), run_name='preview')


def on(color, frame, zoom):
    back = Image.new('RGBA', (frame.shape[1], frame.shape[0]), color + (255,))
    back.alpha_composite(Image.fromarray(frame))
    return back.resize((frame.shape[1] * zoom, frame.shape[0] * zoom), Image.NEAREST)


def strip_rows(strip, rows):
    height = strip.shape[0] // rows
    return [strip[row * height:(row + 1) * height] for row in range(rows)]


def sheet(plain, dressed, rows, zoom):
    plain_rows, dressed_rows = strip_rows(plain, rows), strip_rows(dressed, rows)
    lines = [('night', plain_rows[0])] + [('night', row) for row in dressed_rows]
    lines += [('forest', dressed_rows[0]), ('sand', dressed_rows[0])]
    height = dressed_rows[0].shape[0] * zoom
    out = Image.new('RGBA', (plain.shape[1] * zoom, height * len(lines)), (0, 0, 0, 255))
    for i, (back, row) in enumerate(lines):
        out.paste(on(BACKDROPS[back], row, zoom), (0, i * height))
    draw = ImageDraw.Draw(out)
    for x in range(FW * zoom, out.width, FW * zoom):
        draw.line([(x, 0), (x, out.height)], fill=(255, 0, 255, 255))
    return out


def pixel_grid(frame, zoom=10):
    big = on(BACKDROPS['night'], frame, zoom)
    draw = ImageDraw.Draw(big)
    shade = lambda at: (70, 70, 86, 255) if at % (zoom * 8) else (120, 120, 150, 255)
    for x in range(0, big.width, zoom):
        draw.line([(x, 0), (x, big.height)], fill=shade(x))
    for y in range(0, big.height, zoom):
        draw.line([(0, y), (big.width, y)], fill=shade(y))
    return big


def build(bake, hero):
    import shade_fx
    plain = bake['bake_all'](bake['annotations']())
    dressed = shade_fx.dress(hero, plain, bake['meta'], bake['smear_mask'], bake['glow_mask'])
    ult_path = bake['SRC'] + 'hero_ult.png'
    plain['ult'] = np.array(Image.open(ult_path).convert('RGBA'))
    dressed_ult = shade_fx.dress_ult(hero, ult_path, bake['smear_mask'], bake['glow_mask'])
    dressed = {**dressed, 'ult': dressed_ult if dressed_ult is not None else plain['ult']}
    return plain, dressed


def main(hero, out_dir, picks):
    os.makedirs(out_dir, exist_ok=True)
    bake = load_bake(hero)
    plain, dressed = build(bake, hero)
    pixels = [pick for pick in picks if ':' in pick]
    names = [pick for pick in picks if ':' not in pick] or ([] if pixels else list(dressed))
    for name in names:
        rows = 1 if name == 'ult' else 4
        sheet(plain[name], dressed[name], rows, 3).save(os.path.join(out_dir, f'{hero}_{name}.png'))
    for pick in pixels:
        name, index = pick.split(':')
        rows = 1 if name == 'ult' else 4
        top = strip_rows(dressed[name], rows)[0]
        frame = top[:, int(index) * FW:(int(index) + 1) * FW]
        pixel_grid(frame).save(os.path.join(out_dir, f'{hero}_{name}_{index}_pixels.png'))
    print('wrote', len(names) + len(pixels), 'sheets to', out_dir)


if __name__ == '__main__':
    args = [arg for arg in sys.argv[3:] if arg != '--pixels']
    main(sys.argv[1], sys.argv[2], args)
