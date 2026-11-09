"""Bakes each piece of gear into its own layer: what of it the camera sees in front of the body,
shaded and outlined like the body."""

import sys
from pathlib import Path

import numpy as np

from bake_hair import seen_with
from gear import GEAR, TWINS
from grid import write_grid
from letters import EMPTY, OUTLINE, RAMP_LETTERS, letter_for
from model import body_parts
from pixel import shades_of, tidy
from render import FACINGS

OUT = Path(__file__).resolve().parents[2] / 'concepts' / 'naga-eleven' / 'hero-kit' / 'gear'


def gear_rows(pieces, facing):
    body = body_parts()
    worn = [(f'gear{index}', material, f'gear{index}', shape) for index, (material, shape) in enumerate(pieces)]
    _, _, body_line = seen_with(body, facing)
    seen, material, line = seen_with(body + worn, facing)
    shade = tidy(shades_of(seen, material), material)
    on_gear = np.isin(material, list(RAMP_LETTERS))  & np.isin(material, ['gear', 'metal'])
    rows = []

    for y in range(material.shape[0]):
        row = ''

        for x in range(material.shape[1]):
            if on_gear[y, x]:
                ramp = material[y, x]
                row += OUTLINE if line[y, x] else letter_for(ramp, shade[y, x] - (4 - len(RAMP_LETTERS[ramp])))
            elif line[y, x] and not body_line[y, x]:
                row += OUTLINE
            else:
                row += EMPTY

        rows.append(row)

    return rows


def main(names):
    for name in names or GEAR:
        for direction, facing in FACINGS.items():
            write_grid(OUT / name / f'{direction}.txt', gear_rows(GEAR[name](), facing))

        if name in TWINS:
            for direction in ('south-east', 'east', 'north-east'):
                write_grid(OUT / name / f'{direction}.twin.txt', gear_rows(TWINS[name](), FACINGS[direction]))

        print(f'baked {name}')


if __name__ == '__main__':
    main(sys.argv[1:])
