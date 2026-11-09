"""Writes the hero's hair, taken from the reference, for every direction but the side views (drawn
as locks in hair_art/spiky_east.py): the front as drawn, three-quarters with its fringe turned,
the back turned round with the face filled by hair."""

from pathlib import Path

from body_draw import drawn
from grid import write_grid
from reference.hair import rows as front_rows
from reference.hair import three_quarter_rows
from reference.hair_back import rows as back_rows

OUT = Path(__file__).resolve().parents[3] / 'concepts' / 'naga-eleven' / 'hero-kit' / 'hair' / 'spiky'


def moved(rows, dx):
    width = len(rows[0])

    return [[row[x - dx] if 0 <= x - dx < width else '.' for x in range(width)] for row in rows]


def mirrored(rows):
    return [list(reversed(row)) for row in rows]


def main():
    turned = three_quarter_rows()
    back = back_rows(drawn('north'))
    layers = {
        'north-east': back_rows(drawn('north-east')),
        'north-west': back_rows(drawn('north-west')),
        'south': front_rows(),
        'south-east': turned,
        'south-west': mirrored(turned),
        'north': back,
    }

    for direction, rows in layers.items():
        write_grid(OUT / f'{direction}.txt', [''.join(row) for row in rows])


if __name__ == '__main__':
    main()
