#!/usr/bin/env python3
"""Bake the Clear skins' art from ChatGPT's paintings (assets/skins/README.md).

    python3 tools/clear_skin_art.py insides <in> <out> <width> [quality]
        a handheld's insides, drawn light on black: made grey, shrunk to `width` and saved as a
        WebP. The skin lays it over its plastic with a screen blend, so the black drops out and
        each colour's tint, laid over it, colours the board
    python3 tools/clear_skin_art.py gloss <in> <sideways_out> <upright_out> <width> [quality]
        the light on the plastic, drawn on black and sideways: cut inside the thin outline round
        its edge (a shell stretches over every screen's shape, which would bend that outline's
        corners), brightened until its brightest light is GLOSS_PEAK, shrunk to `width` and saved
        as a WebP; and the same light turned a quarter clockwise for a phone held upright, whose
        screen sits at the top and would hide the light the sideways painting puts there
    python3 tools/clear_skin_art.py keys <in> <out_dir>
        the controls, painted grey on a transparent sheet of three by two cells (the d-pad, a round
        key up and pressed; a pill key up and pressed): each cut out to its own WebP in out_dir,
        KEY_OPACITY see-through.
        A pressed key keeps the canvas of the key up, centred, so it shows a touch smaller as it
        was painted, and a round key and the d-pad stand on square canvases, as their buttons are
"""
import sys
from PIL import Image

QUALITY = 60
# the outline is the brightest thing in the gloss painting; the highlights inside it stay faint
OUTLINE = 100
INSIDE_OUTLINE = 20
# under the plastic's tint, the painting's own faint highlights (about 40) did not show at all
GLOSS_PEAK = 200
# ChatGPT's sheet came with its keys at alpha 252, not quite opaque, and specks of alpha 1 to 3
# scattered over the empty sheet
KEY_SPECKS = 4
KEY_SOLID = 250
# the keys are a little see-through, so each shell's plastic tints them as it does the board
KEY_OPACITY = 0.82
# each key's cell in the sheet, by column and row, and the key whose canvas it shares
KEYS = {
    'dpad': ((0, 0), 'dpad'),
    'key-round': ((1, 0), 'key-round'),
    'key-round-pressed': ((2, 0), 'key-round'),
    'key-pill': ((0, 1), 'key-pill'),
    'key-pill-pressed': ((1, 1), 'key-pill'),
}
KEY_QUALITY = 85


def shrink(image, width):
    height = round(image.height * width / image.width)

    return image.resize((width, height), Image.LANCZOS)


def save(image, out, quality):
    image.save(out, format='WEBP', quality=quality, method=6)
    print(f'{out}: {image.width}x{image.height}')


def insides(source, out, width, quality=QUALITY):
    save(shrink(Image.open(source).convert('L'), width), out, quality)


def gloss(source, sideways_out, upright_out, width, quality=QUALITY):
    image = Image.open(source).convert('L')
    left, top, right, bottom = image.point(lambda value: 255 if value > OUTLINE else 0).getbbox()
    inside = image.crop((left + INSIDE_OUTLINE, top + INSIDE_OUTLINE,
                         right - INSIDE_OUTLINE, bottom - INSIDE_OUTLINE))
    brightest = inside.getextrema()[1]
    lit = shrink(inside.point(lambda value: min(255, round(value * GLOSS_PEAK / brightest))), width)
    save(lit, sideways_out, quality)
    save(lit.transpose(Image.Transpose.ROTATE_270), upright_out, quality)


def solid_alpha(sheet):
    scale = 255 / (KEY_SOLID - KEY_SPECKS)

    return sheet.getchannel('A').point(
        lambda value: round(max(0, min(255, (value - KEY_SPECKS) * scale)) * KEY_OPACITY))


def key_box(sheet, column, row):
    """The box of the key in a cell, made square for any key not wider than it is tall."""
    cell_width, cell_height = sheet.width // 3, sheet.height // 2
    cell = (column * cell_width, row * cell_height, (column + 1) * cell_width, (row + 1) * cell_height)
    left, top, right, bottom = sheet.getchannel('A').crop(cell).getbbox()
    width, height = right - left, bottom - top
    if width < height * 1.2:
        width = height = max(width, height)
    centre_x, centre_y = cell[0] + (left + right) / 2, cell[1] + (top + bottom) / 2

    return centre_x, centre_y, width, height


def keys(source, out_dir):
    sheet = Image.open(source).convert('RGBA')
    sheet.putalpha(solid_alpha(sheet))
    boxes = {name: key_box(sheet, *cell) for name, (cell, _) in KEYS.items()}
    for name, (_, canvas_of) in KEYS.items():
        centre_x, centre_y = boxes[name][:2]
        width, height = boxes[canvas_of][2:]
        left, top = round(centre_x - width / 2), round(centre_y - height / 2)
        key = sheet.crop((left, top, left + width, top + height))
        key.save(f'{out_dir}/{name}.webp', format='WEBP', quality=KEY_QUALITY, method=6)
        print(f'{out_dir}/{name}.webp: {width}x{height}')


def main():
    command, *args = sys.argv[1:]
    if command == 'insides':
        source, out, width, *quality = args
        insides(source, out, int(width), *map(int, quality))
    elif command == 'keys':
        keys(*args)
    else:
        source, sideways_out, upright_out, width, *quality = args
        gloss(source, sideways_out, upright_out, int(width), *map(int, quality))


if __name__ == '__main__':
    main()
