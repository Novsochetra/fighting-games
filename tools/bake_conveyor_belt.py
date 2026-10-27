"""Lean every plate of the Iron Works conveyor's belt the same way.

    python3 tools/bake_conveyor_belt.py <baked conveyor strip> <out>

The baked strip (tools/bake_magenta_sheet.py) paints the plates over the drive end (4) and the far
end (5) leaning as they run toward the drum, but those of the four segments between them (0-3)
standing upright, so along a belt the plates turn one way, then the other. This shears the
segments' band of plates to the ends' lean, each row slid along by how far it is from the band's
middle. A row slides round within the segment's own run of columns, one segment long, so a
segment's plates still meet the next one's where the belt runs on.
"""
import sys

from PIL import Image

FRAME, HEIGHT = 80, 48
SEGMENTS = range(4)
# the band of plates, from the outline over them to the last row above the rollers' rail
BAND_TOP, BAND_BOTTOM = 5, 19
MIDDLE = 12
# how far along a plate of the drive and far ends leans for each row down
LEAN = 0.6
# the columns of a segment's plates: one segment of belt (72 columns), which the next one's
# continue from
RUN_FROM, RUN = 5, 72


def shear(frame):
    pixels = frame.load()
    for y in range(BAND_TOP, BAND_BOTTOM + 1):
        shift = round((y - MIDDLE) * LEAN)
        row = [pixels[RUN_FROM + x, y] for x in range(RUN)]
        for x in range(RUN):
            pixels[RUN_FROM + (x + shift) % RUN, y] = row[x]


def main(source, out):
    strip = Image.open(source).convert('RGBA')
    for index in SEGMENTS:
        frame = strip.crop((index * FRAME, 0, (index + 1) * FRAME, HEIGHT))
        shear(frame)
        strip.paste(frame, (index * FRAME, 0))
    strip.save(out)


if __name__ == '__main__':
    main(*sys.argv[1:])
