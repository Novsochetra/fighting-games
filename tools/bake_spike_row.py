"""Join the Mirage Temple's spike tiles into one slab when they lie in a row.

    python3 tools/bake_spike_row.py <baked spike tile strip> <out>

The baked strip (tools/bake_magenta_sheet.py) paints a tile as a slab on its own, its sides
sloping off to either end, so tiles laid edge to edge leave notches and double rims between
them and read as three bricks dropped on the road. This writes the five frames of the tile four
times over: alone (0-4), the left end of a row (5-9), the middle (10-14) and the right end
(15-19). Wherever a tile meets the next one, its sloping side is replaced by the flat rim running
on, row for row in the slab's own colours, with a thin seam on the line the two tiles share.
"""
import sys

from PIL import Image

FRAME, HEIGHT = 78, 44
PHASES = 5
# the columns a joined side covers, out to the line the two tiles share
LEFT_JOINT, LEFT_SEAM = range(1, 9), 1
RIGHT_JOINT, RIGHT_SEAM = range(70, 78), 77
SLAB_TOP = 16
# under the slots the slab's rim, lip and face run on as in the middle of a resting tile, cracks
# and all, from this row down and from this column along
TEXTURED_FROM, TEXTURE_FROM = 31, 22

OUTLINE = (0x1C, 0x0B, 0x12, 255)
SEAM = (0x68, 0x2D, 0x43, 255)
TOP_RIM = (0xD1, 0x80, 0x51, 255)
RIM = (0xD6, 0x88, 0x54, 255)
LIT_RIM = (0xE2, 0x99, 0x5C, 255)
LIP = (0xF9, 0xCA, 0x8C, 255)
FACE = (0x93, 0x3E, 0x4C, 255)
# the slab running on, top to bottom: its outline, the rim round the slots, the lit lip, the face
# and the outline under it
RIM_ROWS = (
    [OUTLINE]
    + [TOP_RIM] * 4
    + [RIM] * 5
    + [LIT_RIM] * 8
    + [LIP]
    + [FACE] * 6
    + [OUTLINE] * 2
)


def join(frame, rest, joint):
    """the flat rim beside the slots, and under them the resting tile's own rim and cracked face"""
    columns, seam = joint
    pixels, source = frame.load(), rest.load()
    for k, x in enumerate(columns):
        for offset, colour in enumerate(RIM_ROWS):
            y = SLAB_TOP + offset
            below_slots = y >= TEXTURED_FROM
            painted = source[TEXTURE_FROM + k, y] if below_slots else colour
            pixels[x, y] = SEAM if x == seam and colour not in (OUTLINE, LIP) else painted
    if seam == LEFT_SEAM:
        for y in range(SLAB_TOP, HEIGHT):
            pixels[0, y] = (0, 0, 0, 0)


def variants(tile, rest):
    left_end = tile.copy()
    join(left_end, rest, (RIGHT_JOINT, RIGHT_SEAM))
    middle = left_end.copy()
    join(middle, rest, (LEFT_JOINT, LEFT_SEAM))
    right_end = tile.copy()
    join(right_end, rest, (LEFT_JOINT, LEFT_SEAM))
    return [tile.copy(), left_end, middle, right_end]


def main(source, out):
    baked = Image.open(source).convert('RGBA')
    tiles = [baked.crop((i * FRAME, 0, (i + 1) * FRAME, HEIGHT)) for i in range(PHASES)]
    rows = [variants(tile, tiles[0]) for tile in tiles]
    strip = Image.new('RGBA', (FRAME * PHASES * 4, HEIGHT))
    for kind in range(4):
        for phase, kinds in enumerate(rows):
            strip.paste(kinds[kind], ((kind * PHASES + phase) * FRAME, 0))
    strip.save(out)


if __name__ == '__main__':
    main(*sys.argv[1:])
