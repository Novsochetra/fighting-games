"""Writes the hand-drawn marks of marks_art.py into the kit's scar and gear layers."""

from pathlib import Path

from grid import write_grid
from mirror import MIRRORS, flipped_runs
from marks_art import GEAR, SCARS, TWIN_SCARS, TWINNED
from render import HEIGHT, WIDTH

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

    for direction, source in MIRRORS.items():
        for name, directions in SCARS.items():
            runs = TWIN_SCARS[name].get(source, []) if name in TWINNED else directions.get(source, [])
            write_flipped(KIT / 'scars' / name / f'{direction}.txt', runs)

        for name, directions in GEAR.items():
            write_flipped(KIT / 'gear' / name / f'{direction}.txt', directions.get(source, []))


def write_flipped(path, runs):
    if runs:
        write_grid(path, layer(flipped_runs(runs, relight=False)))


if __name__ == '__main__':
    main()
