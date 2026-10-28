"""Lay the Iron Works conveyor's belt with clean plates, every one the same shape and angle.

    python3 tools/bake_conveyor_belt.py <baked conveyor strip> <out>

The baked strip (tools/bake_magenta_sheet.py) paints each plate by hand: light and dark plates of
different widths and grime, upright along the segments but leaning over the drive and far ends,
so along a belt the plates turn and tilt every which way. This paints one pair of plates, a pale
riveted metal plate and the dark plate after it, each outlined, and lays that pair all along every
frame's straight run of belt, each row slid one pixel further along for every two rows down, so
every plate leans at the same angle as the next. The pair is laid from each frame's anchor, and
three pairs make one segment of belt, so a segment's plates meet the next one's where the belt
runs on. The plates curling over the two drums and everything under the belt stay as they were.
"""
import sys

from PIL import Image

FRAME, HEIGHT = 80, 48
ANCHOR_X = 41
# the band of plates: the outline over them, the plates, and the shadow under them
BAND_TOP, PLATES_TOP, PLATES_BOTTOM, BAND_BOTTOM = 5, 6, 18, 19
MIDDLE = 12
# a row slides this many rows down for each pixel it moves along
ROWS_A_PIXEL = 2
# a pale plate, the seam after it, a dark plate and the seam after that: one pair
PALE, DARK, PAIR = 10, 12, 24
# the rivets in the corners of a pale plate, as (column, row) inside it
RIVETS = {(1, 1), (PALE - 2, 1), (1, 11), (PALE - 2, 11)}
# each frame's straight run of belt, clear of the drive gear (4) and the far end's drum (5)
RUNS = [(5, 78), (4, 78), (5, 78), (4, 77), (36, 80), (9, 55)]

SEAM = (0x14, 0x12, 0x13, 255)
PALE_EDGE = (0xC3, 0xA4, 0x75, 255)
PALE_LIT = (0xAD, 0x8F, 0x6B, 255)
PALE_FACE = (0x8F, 0x77, 0x60, 255)
PALE_SHADE = (0x7A, 0x64, 0x50, 255)
RIVET = (0x4B, 0x3D, 0x30, 255)
DARK_EDGE = (0x3A, 0x38, 0x39, 255)
DARK_FACE = (0x31, 0x31, 0x31, 255)
DARK_SHADE = (0x2A, 0x2A, 0x29, 255)


def pale_pixel(x, y):
    if (x, y) in RIVETS:
        return RIVET
    if y == 0:
        return PALE_EDGE
    if y >= PLATES_BOTTOM - PLATES_TOP - 1 or x == PALE - 1:
        return PALE_SHADE
    return PALE_LIT if x == 0 else PALE_FACE


def dark_pixel(y):
    if y == 0:
        return DARK_EDGE
    return DARK_SHADE if y == PLATES_BOTTOM - PLATES_TOP else DARK_FACE


def pair_pixel(x, y):
    """one pixel of the unslid pair, x along it and y down the band"""
    if y in (BAND_TOP, BAND_BOTTOM) or x in (PALE, PAIR - 1):
        return SEAM
    if x < PALE:
        return pale_pixel(x, y - PLATES_TOP)
    return dark_pixel(y - PLATES_TOP)


def slide(y):
    return (y - MIDDLE) // ROWS_A_PIXEL


def lay(frame, run):
    pixels = frame.load()
    for x in range(*run):
        for y in range(BAND_TOP, BAND_BOTTOM + 1):
            pixels[x, y] = pair_pixel((x - ANCHOR_X - slide(y)) % PAIR, y)


def main(source, out):
    strip = Image.open(source).convert('RGBA')
    for index, run in enumerate(RUNS):
        frame = strip.crop((index * FRAME, 0, (index + 1) * FRAME, HEIGHT))
        lay(frame, run)
        strip.paste(frame, (index * FRAME, 0))
    strip.save(out)


if __name__ == '__main__':
    main(*sys.argv[1:])
