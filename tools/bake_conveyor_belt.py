"""Repaint the Iron Works conveyor's belt side-on, as the road and the fighters on it are seen.

    python3 tools/bake_conveyor_belt.py <baked conveyor strip> <out>

The baked strip (tools/bake_magenta_sheet.py) paints the belt's top as a band of plates seen from
above, uneven in height and leaning over the drum like a flight of steps. This paints over that
band, in the strip's own colours, the belt as it is seen from the side: a row of lit slat edges
on top, level with the feet of whoever stands on it, and the dark chain under them, riveted under
every slat. Each frame's band starts at the same column, a whole number of slats from its anchor,
so the segments butt together and the belt runs on without a seam. The rollers, the frame, the
legs and the drive gear stay as they were.
"""
import sys

from PIL import Image

FRAME, HEIGHT = 80, 48
ANCHOR_X = 41
# the band of plates the bake painted, and the rows the side-on belt takes from it: its top as
# high over the feet as the lumps of the road's cinders it is set among, so none show over it
PLATES_TOP, PLATES_BOTTOM = 0, 19
SLATS_TOP = 5
# one slat edge and the gap after it, so twelve to a segment of belt (72 columns)
SLAT = 6
# the columns of each frame the belt runs straight along, clear of the drum at either end
STRAIGHT = [(5, 78), (4, 78), (5, 78), (4, 77), (34, 79), (8, 62)]
# the far end (frame 5): the plates the bake curled up over its drum come off, and the belt ends
# where it turns down round the drum, in a rounded cap
FAR_END = 5
FAR_DRUM = (52, 73, 15)
CAP = {'x': 62, 'y': 12, 'radius': 7}

OUTLINE = (0x0B, 0x06, 0x07, 255)
GAP = (0x13, 0x10, 0x0F, 255)
SLAT_LIT = (0xB3, 0x8B, 0x62, 255)
SLAT_FACE = (0xA8, 0x73, 0x4A, 255)
SLAT_SHADE = (0x90, 0x64, 0x48, 255)
CHAIN_LIT = (0x4C, 0x44, 0x40, 255)
CHAIN = (0x3A, 0x36, 0x37, 255)
CHAIN_DARK = (0x31, 0x30, 0x31, 255)
RIVET = (0x8E, 0x75, 0x61, 255)

# the belt's rows from the top of its slats down to the rail over the rollers; a slat column's
# colour, then a gap column's, and the rivet's row
SLAT_ROWS = [SLAT_LIT, SLAT_FACE, SLAT_FACE, SLAT_SHADE, SLAT_SHADE]
CHAIN_ROWS = [OUTLINE, CHAIN_LIT, CHAIN, CHAIN, CHAIN, CHAIN_DARK, CHAIN_DARK, GAP]
RIVET_ROW = 3


def column_of(x):
    """the belt's pixels down one column, top to bottom"""
    in_slat = (x - ANCHOR_X) % SLAT != SLAT - 1
    slats = SLAT_ROWS if in_slat else [GAP] * len(SLAT_ROWS)
    chain = list(CHAIN_ROWS)
    if (x - ANCHOR_X) % SLAT == SLAT // 2:
        chain[RIVET_ROW] = RIVET
    return [OUTLINE] + slats + chain


def repaint(frame, straight):
    left, right = straight
    pixels = frame.load()
    for x in range(left, right):
        for y in range(PLATES_TOP, SLATS_TOP):
            pixels[x, y] = (0, 0, 0, 0)
        for offset, colour in enumerate(column_of(x)):
            if SLATS_TOP + offset <= PLATES_BOTTOM:
                pixels[x, SLATS_TOP + offset] = colour


def round_off(frame):
    """the far end's drum without the plates curled over it, and the belt's rounded cap"""
    left, right, bottom = FAR_DRUM
    pixels = frame.load()
    for x in range(left, right):
        for y in range(bottom):
            pixels[x, y] = (0, 0, 0, 0)
    for x in range(CAP['x'], CAP['x'] + CAP['radius'] + 1):
        reach = int((CAP['radius'] ** 2 - (x - CAP['x']) ** 2) ** 0.5 + 0.5)
        top, low = CAP['y'] - reach, CAP['y'] + reach
        for y in range(top, low + 1):
            edge = y in (top, low) or x == CAP['x'] + CAP['radius']
            pixels[x, y] = OUTLINE if edge else (SLAT_FACE if y < CAP['y'] - 1 else CHAIN)


def main(source, out):
    strip = Image.open(source).convert('RGBA')
    for index, straight in enumerate(STRAIGHT):
        frame = strip.crop((index * FRAME, 0, (index + 1) * FRAME, HEIGHT))
        if index == FAR_END:
            round_off(frame)
        repaint(frame, straight)
        strip.paste(frame, (index * FRAME, 0))
    strip.save(out)


if __name__ == '__main__':
    main(*sys.argv[1:])
