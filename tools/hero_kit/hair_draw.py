"""Paints the hand-drawn hairstyles from hair_art/ into the kit's hair grids."""

import importlib
import sys
from pathlib import Path

from grid import write_grid
from locks import paint
from render import HEIGHT, WIDTH

OUT = Path(__file__).resolve().parents[2] / 'concepts' / 'naga-eleven' / 'hero-kit' / 'hair'


def draw(style, direction):
    art = importlib.import_module(f'hair_art.{style}_{direction.replace("-", "_")}')
    sheened = set(getattr(art, 'SHEENED', range(len(art.LOCKS))))
    locks = [{**lock, 'sheen': index in sheened} for index, lock in enumerate(art.LOCKS)]
    letters = paint(locks, WIDTH, HEIGHT, sheen=getattr(art, 'SHEEN', frozenset()))

    for x, y in getattr(art, 'FOREHEAD_SHADOW', []):
        if letters[y, x] == '.':
            letters[y, x] = 's'

    for (x, y), letter in getattr(art, 'PIXELS', {}).items():
        letters[y, x] = letter

    write_grid(OUT / style / f'{direction}.txt', [''.join(row) for row in letters])


if __name__ == '__main__':
    draw(sys.argv[1], sys.argv[2])
