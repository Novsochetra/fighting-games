"""Paints the hand-drawn hairstyles from hair_art/ into the kit's hair grids."""

import importlib
import sys
from pathlib import Path

import numpy as np

import bake_hair
from grid import write_grid
from hairstyles import STYLES
from locks import paint
from mirror import MIRRORS, flipped_points
from render import FACINGS, HEIGHT, WIDTH

OUT = Path(__file__).resolve().parents[2] / 'concepts' / 'naga-eleven' / 'hero-kit' / 'hair'


def over_base(letters, base, direction):
    """Drawn locks over a style baked in 3D, as the mohawk's crest over its stubble."""
    rows = bake_hair.clear_face(bake_hair.hair_rows(STYLES()[base], FACINGS[direction]), direction)
    under = np.array([list(row) for row in rows])

    return np.where(letters == '.', under, letters)


def draw(style, direction):
    """A style's layer for a direction. A mirrored direction takes its counterpart's locks with their
    sides swapped (the twin of a lopsided style, so the sweep stays on his own side), painted afresh
    so their light still falls from the upper left."""
    source = MIRRORS.get(direction, direction)
    art = importlib.import_module(f'hair_art.{style}_{source.replace("-", "_")}')

    if direction not in MIRRORS:
        write(style, direction, art, art.LOCKS, getattr(art, 'SHEENED', None), f'{direction}.txt')
        return

    twin = hasattr(art, 'TWIN_LOCKS')
    locks = [{**lock, 'points': flipped_points(lock['points'])} for lock in (art.TWIN_LOCKS if twin else art.LOCKS)]
    sheened = getattr(art, 'TWIN_SHEENED' if twin else 'SHEENED', None)
    write(style, direction, art, locks, sheened, f'{direction}.txt')


def write(style, direction, art, lock_list, sheened, name):
    sheened = set(range(len(lock_list)) if sheened is None else sheened)
    locks = [{**lock, 'sheen': index in sheened} for index, lock in enumerate(lock_list)]
    letters = paint(locks, WIDTH, HEIGHT, sheen=getattr(art, 'SHEEN', frozenset()))

    if hasattr(art, 'BASE'):
        letters = over_base(letters, art.BASE, direction)

    for x, y in getattr(art, 'FOREHEAD_SHADOW', []):
        if letters[y, x] == '.':
            letters[y, x] = 's'

    for (x, y), letter in getattr(art, 'PIXELS', {}).items():
        letters[y, x] = letter

    write_grid(OUT / style / name, [''.join(row) for row in letters])


if __name__ == '__main__':
    draw(sys.argv[1], sys.argv[2])
