"""The close-cropped styles, painted onto each direction's own skull rather than baked in 3D: the
scalp above the hairline (and the whole back of the head) recoloured, as hair for the buzz cut and
as darker skin edged with stubble for the shaved head, so they sit exactly on the painted head."""

from pathlib import Path

from body_draw import drawn
from grid import write_grid
from letters import EMPTY, LETTERS
from render import FACINGS

OUT = Path(__file__).resolve().parents[2] / 'concepts' / 'naga-eleven' / 'hero-kit' / 'hair'

HAIRLINE = 27
NAPE = 34

# where the face is, so the scalp stops at the hairline there and runs down to the nape elsewhere
FACE = {
    'south': (36, 64), 'south-east': (43, 64), 'east': (50, 64), 'north-east': None, 'north': None,
    'north-west': None, 'west': (36, 50), 'south-west': (36, 57),
}

BUZZ = {'L': 'H', 'S': 'h', 's': 'g', 'x': 'g'}
SHAVED = {'L': 'S', 'S': 's', 's': 'x', 'x': 'x'}


def on_scalp(direction, x, y, skull):
    if y <= HAIRLINE:
        return True

    face = FACE[direction]
    inside = skull[0] + 2 <= x <= skull[1] - 2

    return y <= NAPE and inside and (face is None or not face[0] <= x <= face[1])


def layer(direction, shades):
    body = [''.join(row) for row in drawn(direction)]
    rows = [[EMPTY] * len(body[0]) for _ in body]

    for y in range(10, NAPE + 1):
        xs = [x for x, letter in enumerate(body[y]) if letter != EMPTY]

        if not xs:
            continue

        skull = (min(xs), max(xs))

        for x, letter in enumerate(body[y]):
            if letter in shades and LETTERS[letter][0] == 'skin' and on_scalp(direction, x, y, skull):
                rows[y][x] = shades[letter]

    return [''.join(row) for row in rows]


def main():
    for direction in FACINGS:
        write_grid(OUT / 'buzz' / f'{direction}.txt', layer(direction, BUZZ))
        write_grid(OUT / 'shaved' / f'{direction}.txt', layer(direction, SHAVED))


if __name__ == '__main__':
    main()
