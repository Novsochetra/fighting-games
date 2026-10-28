"""Give every plate of the Iron Works conveyor's belt the same shape and the same lean.

    python3 tools/bake_conveyor_belt.py <baked conveyor strip> <out>

The baked strip (tools/bake_magenta_sheet.py) paints each plate by hand: light and dark plates
of different widths, upright along the segments but leaning over the drive and far ends, so along
a belt the plates turn and tilt every which way. This cuts one light plate and the dark plate after
it from the baked art and lays that pair all along every frame's straight run of belt, each row
slid one pixel further along for every two rows down, so every plate leans at the same angle as
the next. The pair is laid from each frame's anchor, and three pairs make one segment of belt, so a
segment's plates meet the next one's where the belt runs on. The plates curling over the two drums
and everything under the belt stay as they were.
"""
import sys

from PIL import Image

FRAME, HEIGHT = 80, 48
ANCHOR_X = 41
# the band of plates, from the outline over them to the last row above the rollers' rail
BAND_TOP, BAND_BOTTOM = 5, 19
MIDDLE = 12
# a row slides this many rows down for each pixel it moves along
ROWS_A_PIXEL = 2
# the pair of plates, cut from a segment (frame 2) where it stands upright: a light plate and the
# dark one after it, the anchor's column at its start
PAIR_FRAME, PAIR_FROM, PAIR = 2, 41, 24
# each frame's straight run of belt, clear of the drive gear (4) and the far end's drum (5)
RUNS = [(5, 78), (4, 78), (5, 78), (4, 77), (36, 80), (9, 55)]


def slide(y):
    return (y - MIDDLE) // ROWS_A_PIXEL


def pair_of(strip):
    pixels = strip.load()
    left = PAIR_FRAME * FRAME + PAIR_FROM
    return [[pixels[left + x, y] for y in range(HEIGHT)] for x in range(PAIR)]


def lay(frame, run, pair):
    pixels = frame.load()
    for x in range(*run):
        for y in range(BAND_TOP, BAND_BOTTOM + 1):
            pixels[x, y] = pair[(x - ANCHOR_X - slide(y)) % PAIR][y]


def main(source, out):
    strip = Image.open(source).convert('RGBA')
    pair = pair_of(strip)
    for index, run in enumerate(RUNS):
        frame = strip.crop((index * FRAME, 0, (index + 1) * FRAME, HEIGHT))
        lay(frame, run, pair)
        strip.paste(frame, (index * FRAME, 0))
    strip.save(out)


if __name__ == '__main__':
    main(*sys.argv[1:])
