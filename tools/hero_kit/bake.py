"""Bakes the blockout's body: each pixel a letter of its material's ramp, shaded and outlined, the
outline black only round the figure and inside it the darkest shade of the part it bounds.
body_draw.py lays the hand-drawn art of body_art/ over it."""

from letters import EMPTY, OUTLINE, RAMP_LETTERS, letter_for
from model import body_parts
from pixel import edges, materials_of, shades_of, tidy
from render import render

BOOT_MARKS = {
    'lace': lambda shade, x, y: 'm' if y % 2 == 0 else letter_for('boots', shade - 1),
    'heel': lambda shade, x, y: letter_for('boots', shade - 1),
}


def on_silhouette(material, y, x):
    height, width = material.shape

    return any(not (0 <= y + dy < height and 0 <= x + dx < width) or material[y + dy, x + dx] == ''
               for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)))


LEG_PARTS = ('thigh', 'shin', 'calf', 'boot', 'collar')


def without_far_leg(parts, far_side):
    # side on, the far leg shows only as a foot floating by the near ankle, so sprites leave it out
    hidden = {f'{name}{far_side}' for name in LEG_PARTS}

    return [part for part in parts if part[0] not in hidden]


def body_rows(facing, far_side=None):
    parts = body_parts() if far_side is None else without_far_leg(body_parts(), far_side)
    seen = render(parts, facing)
    material = materials_of(parts, seen)
    line = edges(material, seen['depth'])
    shade = tidy(shades_of(seen, material), material)
    rows = []

    for y in range(material.shape[0]):
        row = ''

        for x in range(material.shape[1]):
            ramp = material[y, x]

            if ramp == '':
                row += EMPTY
            elif line[y, x] and not on_silhouette(material, y, x) and ramp in RAMP_LETTERS:
                row += RAMP_LETTERS[ramp][0]
            elif line[y, x]:
                row += OUTLINE
            elif ramp in BOOT_MARKS:
                row += BOOT_MARKS[ramp](shade[y, x], x, y)
            else:
                row += letter_for(ramp, shade[y, x] - (4 - len(RAMP_LETTERS[ramp])))

        rows.append(row)

    return rows
