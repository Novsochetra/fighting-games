"""Writes the body grids from the hand-painted masters in body_art/, one per drawn direction; the
three west-facing directions are their mirror images. Each master was seeded from the 3D blockout's
bake (bake.py) and then painted over pixel by pixel."""

import sys
from pathlib import Path

from grid import read_grid, write_grid
from mirror import MIRRORS
from render import FACINGS
from selout import sel_out

MASTERS = Path(__file__).parent / 'body_art'

OUT = Path(__file__).resolve().parents[2] / 'concepts' / 'naga-eleven' / 'hero-kit' / 'body'


def drawn(direction):
    rows = read_grid(MASTERS / f'{MIRRORS.get(direction, direction)}.txt')

    return [list(row[::-1]) for row in rows] if direction in MIRRORS else [list(row) for row in rows]


def main(directions):
    for direction in directions or FACINGS:
        write_grid(OUT / f'{direction}.txt', sel_out([''.join(row) for row in drawn(direction)]))


if __name__ == '__main__':
    main(sys.argv[1:])
