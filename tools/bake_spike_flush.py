"""Set the Mirage Temple's spike tiles flush into the road, their top face all that shows.

    python3 tools/bake_spike_flush.py <baked spike tile strip> <out>

The baked strip (tools/bake_magenta_sheet.py) paints each tile as a raised slab, its dark front
face standing up out of the side-on road. Set flush into the road, a slab shows only its top face,
seen from just above as the road's top is: narrower at its far edge, its sides sloping out toward
the near one, which is its lit lip. This keeps that face, run on to cover the road's whole top
from its far edge to its near one with a second row of slots in front, and drops the front under
the road. The
frames do not line up with each other row for row, so every frame is the resting tile's face, and
what comes up out of its slots is put back over it: one spike, cut clean from the frame where they
stand fully up, out of every slot, as high as each frame of the bake shows them (none, none, half
up, up, sinking), and the warning's dust, painted paler than the sand and rimmed so it reads.
"""
import sys

from PIL import Image

FRAME, HEIGHT = 78, 44
PHASES = 5
REST, WARN, UP = 0, 1, 3
# the top face, from the outline along its far edge to the lit lip along its near one, run on
# to the road's near edge: the bake's rows of it that make each row of the face, the far rim and
# back row of slots, a strip of rim, the front row of slots, the near rim and the lip
FACE_TOP = 16
ROW_FROM = [*range(17, 31), 31, *range(21, 31), 33, 34]
DEPTH = FACE_TOP + 1 + len(ROW_FROM)
# the face's sides on its first and its last row: it is narrower at its far edge
FAR_SIDES, NEAR_SIDES = (8, 72), (1, 76)
# the sheet holds the beat four times over: a tile on its own, then the left end of a row of them,
# its middle and its right end, each joined to the tiles beside it on the line they share, so a
# row is one strip set into the road, sloping only at its two ends
KINDS = ((False, False), (False, True), (True, True), (True, False))
# the spike that comes up out of the middle slot when they are all up: its tip's column, and for
# each row from the tip down to the slot's floor, the columns it spans
SPIKE_TIP = 39
SPIKE_ROWS = {
    8: (39, 39),
    9: (38, 40),
    10: (39, 40),
    11: (39, 40),
    12: (38, 40),
    13: (38, 40),
    14: (38, 41),
    15: (38, 40),
    16: (38, 41),
    17: (37, 41),
    18: (37, 41),
    19: (37, 41),
    20: (36, 41),
    **{row: (36, 42) for row in range(21, 29)},
}
SLOT_FLOOR = 28
# the floors of the back and front rows of slots on the face
SLOT_FLOORS = (SLOT_FLOOR, FACE_TOP + 1 + ROW_FROM.index(SLOT_FLOOR, 15))
OUTLINE = (0x1C, 0x0B, 0x12, 255)
# the middle column of each slot, where its spike stands, and how far down from fully up the
# spikes stand in each frame
TIPS = (18, 29, 39, 50, 61)
DROPS = {2: 8, 3: 0, 4: 14}
# the dust over the far edge, rows 0 to 15, is set down this far, onto the face over the slots,
# and painted paler than the sand, its shades kept, with a rim round each puff
DUST_ROWS, DUST_DROP = 16, 6
DUST = {
    (0xE9, 0xB5, 0x84): (0xF6, 0xE2, 0xC8, 255),
    (0xF9, 0xCA, 0x8C): (0xFB, 0xEE, 0xDA, 255),
    (0xE5, 0xA9, 0x79): (0xE8, 0xC9, 0xAA, 255),
}
DUST_SHADE = (0xCF, 0xA5, 0x8A, 255)
DUST_RIM = (0x8F, 0x62, 0x53, 255)


def extent(pixels, y):
    """the first and last painted columns of a row"""
    painted = [x for x in range(FRAME) if pixels[x, y][3]]
    return painted[0], painted[-1]


def side_at(y, kind):
    """where the face's sides stand on a row of the frame: an open side slopes out evenly from far
    to near, and a side joined to the next tile in its row runs straight down the line they share"""
    share = (y - FACE_TOP - 1) / (len(ROW_FROM) - 1)
    (far_left, far_right), (near_left, near_right) = FAR_SIDES, NEAR_SIDES
    joined_left, joined_right = kind
    left = round(far_left + (near_left - far_left) * share)
    right = round(far_right + (near_right - far_right) * share)
    return (near_left if joined_left else left, near_right if joined_right else right)


def along(x, row_from, row_to):
    """where column x of a source row lands on a row of the face, stretched to its sides"""
    (left, right), (to_left, to_right) = row_from, row_to
    return to_left + round((x - left) * (to_right - to_left) / (right - left))


def face_of(rest, kind):
    """the resting tile's top face run on to the road's near edge: its far rim and back row of
    slots, then a front row of slots, then its near rim and lip, every row stretched to sides that
    slope out evenly, so the front row is a little wider, as nearer things are; its far edge is one
    clean line, where the bake's specks, the grain of a raised slab's top, look like grit"""
    out = Image.new('RGBA', (FRAME, DEPTH))
    source, pixels = rest.load(), out.load()
    for offset, row in enumerate(ROW_FROM):
        y = FACE_TOP + 1 + offset
        left, right = side_at(y, kind)
        src_left, src_right = extent(source, row)
        for x in range(left, right + 1):
            pixels[x, y] = source[along(x, (left, right), (src_left, src_right)), row]
    for x in range(FRAME):
        if pixels[x, FACE_TOP + 1][3]:
            pixels[x, FACE_TOP] = OUTLINE
    return out


def spike_of(up):
    pixels = up.load()
    return {
        (x - SPIKE_TIP, y): pixels[x, y]
        for y, (first, last) in SPIKE_ROWS.items()
        for x in range(first, last + 1)
    }


def slot_middles(rest, floor, kind):
    """the middle column of each slot on the face, in the row of slots whose floor is on `floor`"""
    source_row = ROW_FROM[floor - FACE_TOP - 1]
    stretch = extent(rest.load(), source_row), side_at(floor, kind)
    return [along(tip, *stretch) for tip in TIPS]


def raise_spikes(face, rest, spike, drop, kind):
    """the back row's spikes, then the front row's in front of them"""
    pixels = face.load()
    for floor in SLOT_FLOORS:
        rise = floor - SLOT_FLOOR
        for tip in slot_middles(rest, floor, kind):
            for (dx, y), colour in spike.items():
                if y + drop <= SLOT_FLOOR:
                    pixels[tip + dx, y + drop + rise] = colour


def puff(face, warn):
    """the warning's dust, paler than the sand it rises over and rimmed, so it reads against the
    road and the sky behind"""
    dust = warn.crop((0, 0, FRAME, DUST_ROWS))
    pixels = dust.load()
    painted = {(x, y) for x in range(dust.width) for y in range(dust.height) if pixels[x, y][3]}
    for x, y in painted:
        pixels[x, y] = DUST.get(pixels[x, y][:3], DUST_SHADE)
    for x, y in painted:
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            inside = 0 <= nx < dust.width and 0 <= ny < dust.height
            if inside and (nx, ny) not in painted:
                pixels[nx, ny] = DUST_RIM
    for floor in SLOT_FLOORS:
        face.alpha_composite(dust, (0, DUST_DROP + floor - SLOT_FLOOR))


def main(source, out):
    baked = Image.open(source).convert('RGBA')
    tiles = [baked.crop((i * FRAME, 0, (i + 1) * FRAME, HEIGHT)) for i in range(PHASES)]
    spike = spike_of(tiles[UP])
    strip = Image.new('RGBA', (FRAME * PHASES * len(KINDS), DEPTH))
    for index, kind in enumerate(KINDS):
        for phase in range(PHASES):
            frame = face_of(tiles[REST], kind)
            if phase == WARN:
                puff(frame, tiles[WARN])
            if phase in DROPS:
                raise_spikes(frame, tiles[REST], spike, DROPS[phase], kind)
            strip.paste(frame, ((index * PHASES + phase) * FRAME, 0))
    strip.save(out)


if __name__ == '__main__':
    main(*sys.argv[1:])
