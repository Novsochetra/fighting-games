"""The shirt's number: a small pixel font printed on the shirt where each direction shows it, the
chest from the front and the back from behind. It is drawn after any mirroring, so a mirrored
player's number still reads the right way round."""

import math

CHEST = {
    '0': ['.##.', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
    '1': ['.#', '##', '.#', '.#', '.#', '.#', '.#'],
    '2': ['.##.', '#..#', '...#', '..#.', '.#..', '#...', '####'],
    '3': ['###.', '...#', '...#', '.##.', '...#', '...#', '###.'],
    '4': ['#..#', '#..#', '#..#', '####', '...#', '...#', '...#'],
    '5': ['####', '#...', '###.', '...#', '...#', '#..#', '.##.'],
    '6': ['.##.', '#...', '#...', '###.', '#..#', '#..#', '.##.'],
    '7': ['####', '...#', '...#', '..#.', '..#.', '.#..', '.#..'],
    '8': ['.##.', '#..#', '#..#', '.##.', '#..#', '#..#', '.##.'],
    '9': ['.##.', '#..#', '#..#', '.###', '...#', '...#', '.##.'],
}

TALL_ROWS = [0, 0, 1, 2, 3, 4, 5, 6, 6]


def back_glyph(glyph):
    """The back's digits: the chest's, strokes doubled to two pixels."""
    wide = [''.join(cell * 2 for cell in row) for row in glyph]

    return [wide[row] for row in TALL_ROWS]


def narrow_back_glyph(glyph):
    return [glyph[row] for row in TALL_ROWS]


FONTS = {
    'chest': CHEST,
    'back': {digit: back_glyph(glyph) for digit, glyph in CHEST.items()},
    'back-narrow': {digit: narrow_back_glyph(glyph) for digit, glyph in CHEST.items()},
}

PLACES = {
    'south': ('chest', 49.5, 50, 1),
    'south-east': ('chest', 52.5, 50, 1),
    'north-east': ('back-narrow', 47, 52, 1),
    'north': ('back', 49.5, 49, 2),
}

PRINTED = {'P': 'Y', 'R': 'Y', 'r': 'T', 'd': 't'}

# A seam's trim touching a digit makes it misread (a 1 grows a stroke into a 7), so trim next to the
# number turns back to shirt.
CLEARED = {'t': 'r', 'T': 'R', 'Y': 'R'}


def printed(rows, direction, number, mirrored=False):
    """Prints `number` on the shirt pixels of `rows`, shaded by the shirt beneath it."""
    if direction not in PLACES or not number:
        return rows

    font, centre, top, gap = PLACES[direction]
    glyphs = [FONTS[font][digit] for digit in str(number) if digit in FONTS[font]]
    width = sum(len(glyph[0]) for glyph in glyphs) + gap * (len(glyphs) - 1)
    centre = len(rows[0]) - centre if mirrored else centre
    left = math.floor(centre - width / 2 + 0.5)
    rows = [list(row) for row in rows]

    inked = set()

    for glyph in glyphs:
        for dy, line in enumerate(glyph):
            for dx, cell in enumerate(line):
                under = rows[top + dy][left + dx]

                if cell == '#' and under in PRINTED:
                    rows[top + dy][left + dx] = PRINTED[under]
                    inked.add((left + dx, top + dy))

        left += len(glyph[0]) + gap

    clear_around(rows, inked)

    return [''.join(row) for row in rows]


def clear_around(rows, inked):
    for x, y in inked:
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                near = (x + dx, y + dy)

                if near not in inked and rows[near[1]][near[0]] in CLEARED:
                    rows[near[1]][near[0]] = CLEARED[rows[near[1]][near[0]]]
