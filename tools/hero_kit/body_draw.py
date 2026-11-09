"""Writes the body grids from the hand-painted masters in body_art/, one per drawn direction; the
three west-facing directions are their mirror images, lit again from the upper left. Each master was seeded from the 3D blockout's
bake (bake.py) and then painted over pixel by pixel."""

import sys
from pathlib import Path

from grid import read_grid, write_grid
from letters import LETTERS
from mirror import MIRRORS
from render import FACINGS
from despeckle import despeckled
from selout import sel_out

MASTERS = Path(__file__).parent / 'body_art'

OUT = Path(__file__).resolve().parents[2] / 'concepts' / 'naga-eleven' / 'hero-kit' / 'body'


RELIT = {'skin', 'shirt', 'shorts', 'socks', 'boots', 'hair'}

# the face's features sit inside runs of skin, so the head keeps the flip's light rather than lose them
BELOW_HEAD = 42


def relit_row(row):
    """A mirrored row with each run of one material's shading turned back, so the light that the
    flip moved to the upper right falls from the upper left again."""
    letters, start = list(row), 0

    while start < len(letters):
        ramp = LETTERS.get(letters[start], (None,))[0]
        end = start

        while end < len(letters) and LETTERS.get(letters[end], (None,))[0] == ramp:
            end += 1

        if ramp in RELIT:
            letters[start:end] = letters[start:end][::-1]

        start = max(end, start + 1)

    return letters


def drawn(direction):
    rows = read_grid(MASTERS / f'{MIRRORS.get(direction, direction)}.txt')

    if direction not in MIRRORS:
        return [list(row) for row in rows]

    return [relit_row(row[::-1]) if y >= BELOW_HEAD else list(row[::-1]) for y, row in enumerate(rows)]


def main(directions):
    for direction in directions or FACINGS:
        write_grid(OUT / f'{direction}.txt', sel_out(despeckled([''.join(row) for row in drawn(direction)])))


if __name__ == '__main__':
    main(sys.argv[1:])
