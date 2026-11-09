"""Bakes each hairstyle into its own layer: the hair the camera sees in front of the body, its
outline, and the shadow its fringe throws on the skin just under it."""

import sys
from pathlib import Path

import numpy as np

from grid import write_grid
from hairstyles import STYLES
from letters import EMPTY, OUTLINE, RAMP_LETTERS, letter_for
from model import body_parts
from pixel import edges, materials_of, shades_of, tidy
from render import FACINGS, render

FACE_WINDOWS = {'south': (40, 59, 24), 'south-east': (41, 60, 24), 'east': (50, 64, 24)}

OUT = Path(__file__).resolve().parents[2] / 'concepts' / 'naga-eleven' / 'hero-kit' / 'hair'


def seen_with(parts, facing):
    """Each lock outlined apart from the next where one passes in front of another."""
    seen = render(parts, facing)
    material = materials_of(parts, seen)
    names = np.array([name for name, _, _, _ in parts] + [''])
    apart = np.where(material == 'hair', names[seen['part']], material)

    return seen, material, edges(apart, seen['depth'])


def hair_rows(style, facing):
    shapes, stubble = style
    body = body_parts()
    hair = [(f'hair{index}', 'hair', 'hair', shape) for index, shape in enumerate(shapes)]
    hair += [(f'stubble{index}', 'stubble', 'stubble', shape) for index, shape in enumerate(stubble)]
    _, _, body_line = seen_with(body, facing)
    seen, material, line = seen_with(body + hair, facing)
    shade = tidy(shades_of(seen, material), material)
    is_hair = material == 'hair'
    rows = []

    for y in range(material.shape[0]):
        row = ''

        for x in range(material.shape[1]):
            row += hair_letter(y, x, is_hair, material, line, body_line, shade)

        rows.append(row)

    return rows


def hair_letter(y, x, is_hair, material, line, body_line, shade):
    """A shaved head shows its stubble as hair pixels scattered over the skin."""
    if material[y, x] == 'stubble':
        if line[y, x]:
            return OUTLINE

        return letter_for('hair', shade[y, x] - 1) if x % 2 == 0 and y % 2 == 0 else letter_for('skin', shade[y, x] - 1)

    if is_hair[y, x]:
        return OUTLINE if line[y, x] else letter_for('hair', shade[y, x])

    if line[y, x] and not body_line[y, x]:
        return OUTLINE

    fringe_above = y > 0 and is_hair[y - 1, x] and not line[y, x]

    if fringe_above and material[y, x] == 'skin':
        return letter_for('skin', shade[y, x] - 1)

    return EMPTY


def clear_face(rows, direction):
    """The hand-drawn face sits a little off the 3D skull, so a baked hairline is kept off it: no hair
    below the window's top, and an outline where the hair is cut."""
    if direction not in FACE_WINDOWS:
        return rows

    left, right, top = FACE_WINDOWS[direction]
    rows = [list(row) for row in rows]

    for x in range(left, right + 1):
        for y in range(top, len(rows)):
            if rows[y][x] in RAMP_LETTERS['hair'] + RAMP_LETTERS['skin'] + OUTLINE:
                rows[y][x] = EMPTY

        if rows[top - 1][x] in RAMP_LETTERS['hair']:
            rows[top - 1][x] = OUTLINE

    return [''.join(row) for row in rows]


def main(names):
    styles = STYLES()

    for name in names or styles:
        for direction, facing in FACINGS.items():
            write_grid(OUT / name / f'{direction}.txt', clear_face(hair_rows(styles[name], facing), direction))

        print(f'baked {name}')


if __name__ == '__main__':
    main(sys.argv[1:])
