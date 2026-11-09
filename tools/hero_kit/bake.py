"""Bakes the blockout's body: each pixel a letter of its material's ramp, shaded and outlined.
body_draw.py lays the hand-drawn art of body_art/ over it."""

from letters import EMPTY, OUTLINE, RAMP_LETTERS, letter_for
from model import body_parts
from pixel import edges, materials_of, shades_of, tidy
from render import render

MATERIAL_GROUPS = {
    'shirt': {'shirt', 'trim'},
    'trim': {'shirt', 'trim'},
    'shorts': {'shorts', 'stripe'},
    'stripe': {'shorts', 'stripe'},
}

BOOT_MARKS = {
    'lace': lambda shade, x, y: 'm' if y % 2 == 0 else letter_for('boots', shade - 1),
    'heel': lambda shade, x, y: letter_for('boots', shade - 1),
}


def within_one_material(material, line, y, x):
    """A line between two parts of the same cloth or skin (the far shoulder behind the chest) is
    drawn in that material's darkest shade, so only the figure's edge and where materials meet stay
    black."""
    height, width = material.shape
    neighbours = [(y + dy, x + dx) for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1))]

    if any(not (0 <= ny < height and 0 <= nx < width) or material[ny, nx] == '' for ny, nx in neighbours):
        return False

    group = MATERIAL_GROUPS.get(material[y, x], {material[y, x]})

    return all(material[ny, nx] in group for ny, nx in neighbours)


def body_rows(facing):
    parts = body_parts()
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
            elif line[y, x] and within_one_material(material, line, y, x) and ramp in RAMP_LETTERS:
                row += RAMP_LETTERS[ramp][0]
            elif line[y, x]:
                row += OUTLINE
            elif ramp in BOOT_MARKS:
                row += BOOT_MARKS[ramp](shade[y, x], x, y)
            else:
                row += letter_for(ramp, shade[y, x] - (4 - len(RAMP_LETTERS[ramp])))

        rows.append(row)

    return rows
