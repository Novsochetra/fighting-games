"""Writes the hand-drawn marks of marks_art.py into the kit's scar and gear layers."""

from pathlib import Path

from grid import write_grid
from marks_art import GEAR, SCARS, TWIN_SCARS, TWINNED
from render import HEIGHT, WIDTH

MIRRORED_FROM = ('south-east', 'east', 'north-east')

KIT = Path(__file__).resolve().parents[2] / 'concepts' / 'naga-eleven' / 'hero-kit'


def layer(runs):
    rows = [['.'] * WIDTH for _ in range(HEIGHT)]

    for x, y, run in runs:
        rows[y][x:x + len(run)] = run

    return [''.join(row) for row in rows]


def main():
    for folder, marks in (('scars', SCARS), ('gear', GEAR)):
        for name, directions in marks.items():
            for direction, runs in directions.items():
                write_grid(KIT / folder / name / f'{direction}.txt', layer(runs))

    for name in TWINNED:
        for direction in MIRRORED_FROM:
            write_grid(KIT / 'scars' / name / f'{direction}.twin.txt', layer(TWIN_SCARS[name].get(direction, [])))


if __name__ == '__main__':
    main()
