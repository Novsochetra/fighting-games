"""The reference sprite's hair, read into the hair layer's letters: its purple the hair's base, its
blue the sheen, its near-black the outline and the dark between locks."""

from reference.front import COLOURS, DOWN, REFERENCE

from PIL import Image

LAST_HAIR_ROW = 30
LAST_FRINGE_ROW = 33
HAIR = {'H': 'h', 'B': 'J', 'D': 'g', 'o': 'o'}


def rows():
    image = Image.open(REFERENCE).convert('RGBA')
    grid = [['.'] * 100 for _ in range(116)]

    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = image.getpixel((x, y))
            letter = COLOURS[f'{red:02x}{green:02x}{blue:02x}'] if alpha else None

            row = y + DOWN
            fringe = letter in ('H', 'B', 'D') and row <= LAST_FRINGE_ROW

            if letter in HAIR and (row <= LAST_HAIR_ROW or fringe):
                grid[y + DOWN][x + 1] = HAIR[letter]

    return grid


FRINGE_ROWS = range(26, 34)


def three_quarter_rows():
    """The hair three-quarters to the front: the reference's, its fringe moved toward his turned
    face."""
    hair = rows()
    turned = [['.'] * len(row) for row in hair]

    for y, row in enumerate(hair):
        shift = 2 if y in FRINGE_ROWS else 0

        for x, letter in enumerate(row):
            if letter != '.' and 0 <= x + shift < len(row):
                turned[y][x + shift] = letter

    return turned
