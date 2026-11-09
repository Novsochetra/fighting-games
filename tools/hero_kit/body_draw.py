"""Draws the body grids: the blockout's bake with the hand-drawn art of body_art/ over it."""

import importlib
import sys
from pathlib import Path

from bake import body_rows
from grid import write_grid
from mirror import MIRRORS, flipped_runs
from render import FACINGS

FAR_LEG = {'east': -1, 'west': 1}

OUT = Path(__file__).resolve().parents[2] / 'concepts' / 'naga-eleven' / 'hero-kit' / 'body'


def head_row(left, right, lit, shadow, deep):
    inner = right - left - 1
    base = inner - lit - shadow - deep

    return 'o' + 'L' * lit + 'S' * base + 's' * shadow + 'x' * deep + 'o'


def drawn(direction):
    rows = [list(row) for row in body_rows(FACINGS[direction], FAR_LEG.get(direction))]
    module = f'body_art.{MIRRORS.get(direction, direction).replace("-", "_")}'

    try:
        art = importlib.import_module(module)
    except ModuleNotFoundError:
        return rows

    if direction in MIRRORS:
        for x, y, run in flipped_runs(getattr(art, 'RUNS', [])):
            rows[y][x:x + len(run)] = run

        return rows

    for y, (left, right, lit, shadow, deep) in getattr(art, 'HEAD', {}).items():
        rows[y][left:right + 1] = head_row(left, right, lit, shadow, deep)

    for x, y, run in getattr(art, 'RUNS', []):
        rows[y][x:x + len(run)] = run

    for x, top, block in getattr(art, 'BLOCKS', []):
        for dy, line in enumerate(block):
            for dx, letter in enumerate(line):
                if letter != '_':
                    rows[top + dy][x + dx] = letter

    return rows


def main(directions):
    for direction in directions or FACINGS:
        write_grid(OUT / f'{direction}.txt', [''.join(row) for row in drawn(direction)])


if __name__ == '__main__':
    main(sys.argv[1:])
