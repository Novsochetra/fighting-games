"""Puts a player together from the kit's grids and paints it in his colours."""

from pathlib import Path

from PIL import Image

from grid import read_grid
from letters import EMPTY, LETTERS, OUTLINE
from number import printed

KIT = Path(__file__).resolve().parents[2] / 'concepts' / 'naga-eleven' / 'hero-kit'


def hex_rgb(value):
    return tuple(int(value[i:i + 2], 16) for i in (1, 3, 5)) + (255,)


def layer_paths(look, direction):
    paths = [KIT / 'body' / f'{direction}.txt']
    paths += [KIT / 'scars' / scar / f'{direction}.txt' for scar in look.get('scars', [])]
    paths.append(KIT / 'hair' / look['hair'] / f'{direction}.txt')
    paths += [KIT / 'gear' / item / f'{direction}.txt' for item in look.get('gear', [])]

    return [path for path in paths if path.exists()]


def stacked(look, direction):
    rows = None

    for path in layer_paths(look, direction):
        layer = read_grid(path)

        if rows is None:
            rows = [list(row) for row in printed(layer, direction, look.get('number'))]
            continue

        for y, row in enumerate(layer):
            for x, letter in enumerate(row):
                if letter != EMPTY:
                    rows[y][x] = letter

    return rows


def painted(rows, colours):
    image = Image.new('RGBA', (len(rows[0]), len(rows)))

    for y, row in enumerate(rows):
        for x, letter in enumerate(row):
            if letter == EMPTY:
                continue

            if letter == OUTLINE:
                image.putpixel((x, y), hex_rgb(colours['outline']))
                continue

            ramp, shade = LETTERS[letter]
            image.putpixel((x, y), hex_rgb(colours[ramp][shade]))

    return image
