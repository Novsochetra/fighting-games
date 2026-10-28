"""Set the Mirage Temple's spike tiles flush into the road, their top face all that shows.

    python3 tools/bake_spike_flush.py <baked spike tile strip> <game folder>

The baked strip (tools/bake_magenta_sheet.py) paints each tile as a raised slab, its dark front
face standing up out of the side-on road. Set flush into the road, a slab shows only its top face,
seen from just above as the road's top is: narrower at its far edge, its sides sloping out toward
the near one, which is its lit lip. This keeps that face, run on to cover the road's whole top
from its far edge to its near one with a second row of slots in front, and drops the front under
the road. The frames do not line up with each other row for row, so every frame is the resting
tile's face, and what comes up out of its slots is put back over it: the warning's dust, painted
paler than the sand and rimmed so it reads, and a spike out of every slot, as high as each frame of
the bake shows them (none, none, half up, up, sinking). The bake's spikes stand a third as high as they stab, and are
cut too close to the tile to stretch, so one spike is painted here in the bronze of theirs, as long
as the back row needs to stand as high as the spikes stab, the frame that much taller over the
face; the back row a shade darker, as it stands farther in.

The stone is the road's own: each of its colours becomes the colour of the Mirage Temple road's
cross-section (assets/backdrops/mirage-temple/ground.png) nearest it in lightness, its far edge and
the seams between tiles the road's dark brick, and a little of the road's sand drifts over its far
edge, so it lies in the road rather than on it.
"""
import sys

from PIL import Image

FRAME, HEIGHT = 78, 44
PHASES = 5
REST, WARN = 0, 1
# the top face, from the outline along its far edge to the lit lip along its near one, run on
# to the road's near edge: the bake's rows of it that make each row of the face, the far rim and
# back row of slots, a strip of rim, the front row of slots, the near rim and the lip
FACE_TOP = 16
ROW_FROM = [*range(18, 31), 31, *range(21, 31), 34]
DEPTH = FACE_TOP + 1 + len(ROW_FROM)
# the face's sides on its first and its last row: it is narrower at its far edge
FAR_SIDES, NEAR_SIDES = (8, 72), (1, 76)
# the sheet holds the beat four times over: a tile on its own, then the left end of a row of them,
# its middle and its right end, each joined to the tiles beside it on the line they share, so a
# row is one strip set into the road, sloping only at its two ends
KINDS = ((False, False), (False, True), (True, True), (True, False))
# the floor of a slot in the bake's tile
SLOT_FLOOR = 28
# the floors of the back and front rows of slots on the face
SLOT_FLOORS = tuple(FACE_TOP + 1 + i for i, row in enumerate(ROW_FROM) if row == SLOT_FLOOR)
# the road's cross-section, whose colours the stone takes, from its sand down to its bricks, and
# two paler tints of its sand for the stone's lit edges
ROAD = 'assets/backdrops/mirage-temple/ground.png'
ROAD_ROWS = range(15, 60)
LIT_SAND = [(0xF6, 0xBF, 0x98, 255), (0xFA, 0xD3, 0xB4, 255)]
# the far edge and the seams between tiles, in the road's dark brick
SEAM = (0x70, 0x31, 0x3D, 255)
# the road's sand, drifting over the far edge in uneven runs: the columns each run starts on
# along the frame and how long it is
SAND = [(0xF0, 0xA3, 0x7D, 255), (0xEA, 0x8B, 0x6D, 255)]
DRIFTS = [(3, 2), (11, 1), (17, 3), (29, 1), (34, 2), (46, 1), (53, 3), (62, 1), (70, 2)]
OUTLINE = (0x1C, 0x0B, 0x12, 255)
# the middle column of each slot, where its spike stands, and how far down from fully up the
# spikes stand in each frame
TIPS = (18, 29, 39, 50, 61)
DROPS = {2: 16, 3: 0, 4: 29}
# the spikes stab this high over the road (SPIKE_TRAP.height, at the sheet's twice the density),
# and the back row stands that high from its slots' floor; the frame is as much taller over the face
STAB = 32
HEADROOM = STAB - FACE_TOP
# the front row of slots stands between the back row's, so its spikes rise in the gaps between
# theirs instead of hiding them: four slots, each midway between two of the back row's as drawn;
# the bake's rows of a slot (the bevel over its opening down to the lit rim under it), a row of its
# opening, and the face's rows, by their place in ROW_FROM, that are the front row
SLOT_ROWS = range(24, 30)
OPENING = 27
FRONT_ROW = range(14, 24)
# a spike from its tip down to its slot's floor, how wide it is on each row: a needle that widens a
# pixel at a time, its left and right edges stepping out in turn
WIDTHS = [1] * 3 + [2] * 7 + [3] * 7 + [4] * 7 + [5] * 7 + [6] * 7 + [7] * 6
# the bronze of the bake's spikes, lit from the left, edged dark against the sky and the sand
GLINT = (0xE4, 0xA1, 0x62, 255)
HIGH = (0xE9, 0xA7, 0x66, 255)
LIT = (0xDC, 0x88, 0x40, 255)
MID = (0xC4, 0x71, 0x3D, 255)
SHADE = (0x90, 0x40, 0x24, 255)
DEEP = (0x6D, 0x33, 0x24, 255)
LINE = (0x29, 0x0F, 0x17, 255)
ACROSS = {
    1: [GLINT],
    2: [LIT, LINE],
    3: [DEEP, LIT, LINE],
    4: [DEEP, HIGH, SHADE, LINE],
    5: [DEEP, HIGH, MID, SHADE, LINE],
    6: [DEEP, HIGH, LIT, MID, SHADE, LINE],
    7: [DEEP, HIGH, LIT, MID, SHADE, DEEP, LINE],
}
FARTHER = {GLINT: LIT, HIGH: LIT, LIT: MID, MID: SHADE, SHADE: DEEP, DEEP: LINE}
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


def slot_spans(rest):
    """the columns of each slot of the bake's tile, its dark opening and the rim either side"""
    pixels = rest.load()
    spans = []
    for tip in TIPS:
        dark = [x for x in range(tip - 6, tip + 7) if pixels[x, OPENING][0] < 120]
        spans.append((dark[0] - 1, dark[-1] + 1))
    return spans


def front_tips(rest, kind):
    """the columns of the bake's tile to set the front row's slots on, so that, stretched wider than
    the back row as the face's sides slope out, each lands midway between two of the back row"""
    back = slot_middles(rest, SLOT_FLOORS[0], kind, TIPS)
    (src_left, src_right) = extent(rest.load(), ROW_FROM[SLOT_FLOORS[1] - FACE_TOP - 1])
    (left, right) = side_at(SLOT_FLOORS[1], kind)
    middles = [(one + other) / 2 for one, other in zip(back, back[1:])]
    return [round(src_left + (x - left) * (src_right - src_left) / (right - left)) for x in middles]


def staggered(rest, kind):
    """the bake's tile with its row of slots moved to stand between where they were: the slots
    filled in with the stone nearest them on their rows, then four of them set down again"""
    out = rest.copy()
    pixels, source = out.load(), rest.load()
    spans = slot_spans(rest)
    slotted = {x for left, right in spans for x in range(left, right + 1)}
    stone = [x for x in range(spans[0][0], spans[-1][1] + 1) if x not in slotted]
    for y in SLOT_ROWS:
        for x in slotted:
            pixels[x, y] = source[min(stone, key=lambda bare: abs(bare - x)), y]
        for (left, right), tip, middle in zip(spans, TIPS, front_tips(rest, kind)):
            for x in range(left, right + 1):
                pixels[x + middle - tip, y] = source[x, y]
    return out


def face_of(rest, kind):
    """the resting tile's top face run on to the road's near edge: its far rim and back row of
    slots, then a front row of slots between them, then its lit lip, every row stretched to its
    sides, so the front row is a little wider, as nearer things are"""
    out = Image.new('RGBA', (FRAME, DEPTH))
    back, front, pixels = rest.load(), staggered(rest, kind).load(), out.load()
    for offset, row in enumerate(ROW_FROM):
        source = front if offset in FRONT_ROW else back
        y = FACE_TOP + 1 + offset
        left, right = side_at(y, kind)
        src_left, src_right = extent(source, row)
        for x in range(left, right + 1):
            pixels[x, y] = source[along(x, (left, right), (src_left, src_right)), row]
    return out


def lightness(colour):
    red, green, blue = colour[:3]
    return 0.299 * red + 0.587 * green + 0.114 * blue


def road_colours(game):
    road = Image.open(f'{game}/{ROAD}').convert('RGBA')
    pixels = road.load()
    found = {pixels[x, y] for x in range(road.width) for y in ROAD_ROWS if pixels[x, y][3] == 255}
    return sorted([*found, *LIT_SAND], key=lightness)


def in_road_stone(face, palette):
    """every colour of the stone turned to the road's colour nearest it in lightness"""
    pixels = face.load()
    for x in range(face.width):
        for y in range(face.height):
            if pixels[x, y][3]:
                pixels[x, y] = min(palette, key=lambda c: abs(lightness(c) - lightness(pixels[x, y])))


def joined(face, kind):
    """a side joined to the next tile is the stone's rim running on to one seam on the line they
    share, not the bevel and outline of a slab's edge"""
    pixels = face.load()
    joined_left, joined_right = kind
    for y in range(FACE_TOP + 1, DEPTH):
        if joined_left:
            for x in range(1, 4):
                pixels[x, y] = pixels[4, y]
            pixels[1, y] = SEAM
        if joined_right:
            for x in range(73, 77):
                pixels[x, y] = pixels[72, y]


def far_edge(face):
    """the far edge one clean line of the road's dark brick, where the bake's specks, the grain of
    a raised slab's top, look like grit, with the road's sand drifting over it here and there"""
    pixels = face.load()
    drifted = {start + i for start, run in DRIFTS for i in range(run)}
    for x in range(FRAME):
        if pixels[x, FACE_TOP + 1][3]:
            pixels[x, FACE_TOP] = SAND[x % 2] if x in drifted else SEAM


def stone(rest, kind, palette):
    face = face_of(rest, kind)
    in_road_stone(face, palette)
    joined(face, kind)
    far_edge(face)
    return face


def slot_middles(rest, floor, kind, tips):
    """the middle column of each slot on the face, in the row of slots whose floor is on `floor`"""
    source_row = ROW_FROM[floor - FACE_TOP - 1]
    stretch = extent(rest.load(), source_row), side_at(floor, kind)
    return [along(tip, *stretch) for tip in tips]


def raise_spikes(frame, rest, drop, kind):
    """the back row's spikes, a shade darker, then the front row's in front of them, each only as
    far as it has come up out of its slot"""
    pixels = frame.load()
    for floor, tips, shade in zip(SLOT_FLOORS, (TIPS, front_tips(rest, kind)), (FARTHER, {})):
        for middle in slot_middles(rest, floor, kind, tips):
            for row, width in enumerate(WIDTHS):
                y = floor - len(WIDTHS) + 1 + row + drop
                if y > floor:
                    continue
                for dx, colour in zip(range(-(width // 2), width), ACROSS[width]):
                    pixels[middle + dx, HEADROOM + y] = shade.get(colour, colour)


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


def frame_of(tiles, kind, phase, palette):
    face = stone(tiles[REST], kind, palette)
    if phase == WARN:
        puff(face, tiles[WARN])
    frame = Image.new('RGBA', (FRAME, HEADROOM + DEPTH))
    frame.paste(face, (0, HEADROOM))
    if phase in DROPS:
        raise_spikes(frame, tiles[REST], DROPS[phase], kind)
    return frame


def main(source, game):
    baked = Image.open(source).convert('RGBA')
    tiles = [baked.crop((i * FRAME, 0, (i + 1) * FRAME, HEIGHT)) for i in range(PHASES)]
    palette = road_colours(game)
    strip = Image.new('RGBA', (FRAME * PHASES * len(KINDS), HEADROOM + DEPTH))
    for index, kind in enumerate(KINDS):
        for phase in range(PHASES):
            strip.paste(frame_of(tiles, kind, phase, palette), ((index * PHASES + phase) * FRAME, 0))
    strip.save(f'{game}/assets/sprites/fx/spikeTrap.png')


if __name__ == '__main__':
    main(*sys.argv[1:])
