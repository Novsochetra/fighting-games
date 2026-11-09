"""The reference sprite's body from the neck down, read into the kit's letters by region: its reds
become shirt or socks by where they sit, its blues shorts, its whites and lilacs the shorts'
stripe or the boots, its printed number plain shirt again (the kit prints any number)."""

from pathlib import Path

from PIL import Image

REFERENCE = Path(__file__).resolve().parents[3] / 'concepts' / 'naga-eleven' / 'hero-kit' / 'reference.png'
DOWN = 11
NECK_ROW = 40

COLOURS = {
    '180411': 'o', '000000': 'o', '370e22': 'D',
    'f49348': 'S', 'b8502b': 's',
    'df2321': 'R', 'b7101c': 'r', '850d19': 'd',
    'fcb94c': 'Y', '283ca0': 'B', '191c5a': 'b', '36224a': 'H',
    'dfdae6': 'W', '8980ae': 'w',
}

SHIRT_END, SHORTS_END, SOCKS_END = 65, 77, 97
NUMBER = (46, 47, 56, 56)


def letter_at(colour, x, y):
    if y < SHIRT_END:
        return shirt_letter(colour, x, y)

    if y < SHORTS_END:
        return {'B': 'B', 'b': 'b', 'W': 'V', 'w': 'v', 'D': 'o', 'R': 'R', 'r': 'r', 'd': 'd'}.get(colour, colour)

    if y < SOCKS_END:
        return {'R': 'F', 'r': 'f', 'd': 'e', 'D': 'e'}.get(colour, colour)

    return {'W': 'U', 'w': 'u', 'D': 'o', 'H': 'n', 'R': 'F', 'r': 'f', 'd': 'e'}.get(colour, colour)


def shirt_letter(colour, x, y):
    left, top, right, bottom = NUMBER
    on_number = left <= x <= right and top <= y <= bottom

    if colour == 'Y':
        return 'R' if on_number else 'T'

    return {'D': 'd'}.get(colour, colour)


FACE_TOP = 31
FACE = {'S': 'S', 's': 's', 'o': 'o', 'D': 'o', 'W': 'E', 'Y': 'S', 'R': 'S', 'H': None, 'B': None}
STRAYS = {(46, 35): 'S', (51, 35): 'S'}


def face_letter(colour, x, y):
    """The reference's face, its stray yellow and white specks skin again; its fringe is hair."""
    return STRAYS.get((x, y), FACE.get(colour))


def face_rows(grid):
    image = Image.open(REFERENCE).convert('RGBA')

    for y in range(FACE_TOP, NECK_ROW):
        for x in range(image.width):
            red, green, blue, alpha = image.getpixel((x, y - DOWN))
            letter = face_letter(COLOURS[f'{red:02x}{green:02x}{blue:02x}'], x, y) if alpha else None

            if letter:
                grid[y][x] = letter

    return grid


def rows():
    image = Image.open(REFERENCE).convert('RGBA')
    grid = [['.'] * 100 for _ in range(116)]

    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = image.getpixel((x, y))

            if alpha and y + DOWN >= NECK_ROW:
                grid[y + DOWN][x] = letter_at(COLOURS[f'{red:02x}{green:02x}{blue:02x}'], x, y + DOWN)

    return grid
