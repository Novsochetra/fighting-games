"""Set the Mirage Temple's spike tiles flush into the road, their top face all that shows.

    python3 tools/bake_spike_flush.py <baked spike tile strip> <out>

The baked strip (tools/bake_magenta_sheet.py) paints each tile as a raised slab, its dark front
face standing up out of the side-on road. Set flush into the road, a slab shows only its top face,
seen from just above as the road's top is: narrower at its far edge, its sides sloping out toward
the near one, which is its lit lip. This keeps that face and drops the front under the road. The
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
# the top face, from the outline along its far edge to the lit lip along its near one
FACE_TOP, LIP = 16, 34
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


def face_of(rest):
    """the resting tile's top face, its far edge drawn as one clean line: the bake's specks along
    it, the grain of a raised slab's top, look like grit lying on a face set flush in the road"""
    out = Image.new('RGBA', (FRAME, LIP + 1))
    out.alpha_composite(rest.crop((0, FACE_TOP + 1, FRAME, LIP + 1)), (0, FACE_TOP + 1))
    pixels = out.load()
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


def raise_spikes(face, spike, drop):
    pixels = face.load()
    for tip in TIPS:
        for (dx, y), colour in spike.items():
            if y + drop <= SLOT_FLOOR:
                pixels[tip + dx, y + drop] = colour


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
    face.alpha_composite(dust, (0, DUST_DROP))


def main(source, out):
    baked = Image.open(source).convert('RGBA')
    tiles = [baked.crop((i * FRAME, 0, (i + 1) * FRAME, HEIGHT)) for i in range(PHASES)]
    spike = spike_of(tiles[UP])
    frames = []
    for phase in range(PHASES):
        frame = face_of(tiles[REST])
        if phase == WARN:
            puff(frame, tiles[WARN])
        if phase in DROPS:
            raise_spikes(frame, spike, DROPS[phase])
        frames.append(frame)
    strip = Image.new('RGBA', (FRAME * PHASES, LIP + 1))
    for phase, frame in enumerate(frames):
        strip.paste(frame, (phase * FRAME, 0))
    strip.save(out)


if __name__ == '__main__':
    main(*sys.argv[1:])
