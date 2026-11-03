#!/usr/bin/env python3
"""Bake Naga Eleven's face kit from ChatGPT's sheets (concepts/naga-eleven/face-kit/README.md).

    python3 tools/face_kit/bake.py            writes apps/web/games/naga-eleven/src/art/face-kit/
    python3 tools/face_kit/bake.py --measure  prints each sheet's skull radius, to set its block

Each face is kept whole in every mood; each hairstyle and hat is only its own pixels and the
outline round them, placed on a face by the top of the skull (sheets.py says which cell is what).
"""
import argparse
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)

from cells import read_sheet, read_single  # noqa: E402
from encode import encode, module  # noqa: E402
from label import label  # noqa: E402
from parts import (calibrate, face_letters, facial_letters, gear_letters, hair_letters, layer_anchor,  # noqa: E402
                   sheet_offset, skull_anchor)
from sheets import (BLOCKS, CALIBRATION, FACES, FACIAL, FACIAL_BLOCK, GEAR, HAIR, SINGLE_GEAR,  # noqa: E402
                    SINGLE_GEAR_BLOCK, SKULL_SHOWN, SOURCE)

OUT = os.path.join(ROOT, 'apps/web/games/naga-eleven/src/art/face-kit')


def read_all():
    cells = {}
    for name, block in BLOCKS.items():
        images = read_sheet(os.path.join(ROOT, SOURCE), name, block)
        cells.update({(name, i + 1): label(image) for i, image in enumerate(images)})
    return cells


def bake_faces(cells, ranges):
    baked = {}
    for face, moods in FACES.items():
        parts = {}
        for mood, where in moods.items():
            letters = face_letters(cells[where], ranges)
            parts[mood] = encode(letters, skull_anchor(letters))
        baked[face] = parts
    return baked


def offsets(cells, ranges):
    return {sheet: sheet_offset(cells[where], face_letters(cells[where], ranges))
            for sheet, where in SKULL_SHOWN.items()}


def bake_layers(cells, table, letters_of, shift):
    return {name: encode(letters_of(cells[where]), layer_anchor(cells[where], shift[where[0]]))
            for name, where in table.items()}


def bake_singles(table, block, letters_of, ranges):
    """Each painted on a face of its own, so it lines up by that face's skull."""
    baked = {}
    for name, source in table.items():
        cell = label(read_single(os.path.join(ROOT, SOURCE), source, block))
        baked[name] = encode(letters_of(cell), skull_anchor(face_letters(cell, ranges)))
    return baked


def write(name, text):
    os.makedirs(os.path.dirname(name), exist_ok=True)
    with open(name, 'w') as out:
        out.write(text)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--measure', action='store_true')
    args = parser.parse_args()
    cells = read_all()
    ranges = calibrate(cells[CALIBRATION])
    if args.measure:
        return measure(cells, ranges)
    for face, parts in bake_faces(cells, ranges).items():
        write(os.path.join(OUT, 'faces', f'{face}.js'), module(f'{face.upper()}_MOODS', parts))
    shift = offsets(cells, ranges)
    write(os.path.join(OUT, 'hair.js'), module('KIT_HAIR', bake_layers(cells, HAIR, hair_letters, shift)))
    gear = {**bake_layers(cells, GEAR, gear_letters, shift),
            **bake_singles(SINGLE_GEAR, SINGLE_GEAR_BLOCK, gear_letters, ranges)}
    write(os.path.join(OUT, 'gear.js'), module('KIT_GEAR', gear))
    write(os.path.join(OUT, 'facial.js'), module('KIT_FACIAL', bake_singles(FACIAL, FACIAL_BLOCK, facial_letters, ranges)))
    print(f'baked {len(FACES)} faces, {len(HAIR)} hairstyles, {len(gear)} hats and trinkets, '
          f'{len(FACIAL)} beards into {OUT}')


def measure(cells, ranges):
    for (sheet, cell), labelled in sorted(cells.items()):
        letters = face_letters(labelled, ranges)
        top = min(y for _, y in letters)
        xs = [x for x, y in letters if y == top + 10]
        width = max(xs) - min(xs) + 1
        print(f'{sheet} {cell}: skull radius {(width * width / 4 + 100) / 20:.1f}')


if __name__ == '__main__':
    main()
