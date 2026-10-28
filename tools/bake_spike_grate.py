"""Cut the Mirage Temple's spike tiles down to flat grates set into the road.

    python3 tools/bake_spike_grate.py <baked spike tile strip> <out>

The baked strip (tools/bake_magenta_sheet.py) paints each tile as a raised slab, its sides
sloping off to either end, so a row of them read as bricks dropped on the side-on road rather
than part of it. This keeps only the slotted panel let into the slab's top, as a grate let into the
road (its far edge narrower than its near one, as the road's top is seen, the far edge in shadow and
the near one catching the light), and puts back what comes up out of its slots. The frames do not line up with each other row for row, so the
spikes are not cut out of each one: one spike, cut clean from the frame where they stand fully up,
comes up out of every slot, as high as each frame of the bake shows them (none, none, half up, up,
sinking). The warning's dust is the bake's own, set down onto the grate.
"""
import sys

from PIL import Image

FRAME, HEIGHT = 78, 44
PHASES = 5
REST, WARN, UP = 0, 1, 3
# the panel of slots in the slab's top, from its dark top edge to its bottom, side to side
PANEL = {'left': 10, 'right': 68, 'top': 21, 'bottom': 30}
OUTLINE = (0x1C, 0x0B, 0x12, 255)
SHADOW = (0x52, 0x23, 0x35, 255)
SIDE = (0x41, 0x1A, 0x1B, 255)
LIP = (0xF9, 0xCA, 0x8C, 255)
# the grate's sides close in a pixel toward its far edge for every this many rows up
ROWS_A_STEP = 3
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
# the middle column of each slot, where its spike stands, and how far down from fully up the
# spikes stand in each frame
TIPS = (18, 29, 39, 50, 61)
DROPS = {2: 8, 3: 0, 4: 14}
# the dust over the rim, rows 0 to 15, is set down this far, onto the grate, and painted paler
# than the sand, its shades kept, with a rim round each puff
DUST_ROWS, DUST_DROP = 16, 5
DUST = {
    (0xE9, 0xB5, 0x84): (0xF6, 0xE2, 0xC8, 255),
    (0xF9, 0xCA, 0x8C): (0xFB, 0xEE, 0xDA, 255),
    (0xE5, 0xA9, 0x79): (0xE8, 0xC9, 0xAA, 255),
}
DUST_SHADE = (0xCF, 0xA5, 0x8A, 255)
DUST_RIM = (0x8F, 0x62, 0x53, 255)


def edge(row):
    """how far in from the near edge's ends the grate's side stands on a row: set into the road,
    its far edge is narrower than its near one, as the road's top is seen"""
    return (PANEL['bottom'] - row) // ROWS_A_STEP


def sunk_grate(tile):
    """the panel of slots let into the road: its far edge dark with the shadow of the hole's far
    wall under it, its sides closing in toward the far edge, and its near edge catching the light"""
    left, top, bottom = PANEL['left'], PANEL['top'], PANEL['bottom']
    width = PANEL['right'] - left + 1
    out = Image.new('RGBA', (width, bottom + 1))
    pixels, source = out.load(), tile.load()
    for y in range(top, bottom + 1):
        first, last = edge(y), width - 1 - edge(y)
        for x in range(first, last + 1):
            if y == top:
                colour = OUTLINE
            elif y == bottom:
                colour = LIP
            elif x in (first, last):
                colour = SIDE
            elif y == top + 1:
                colour = SHADOW
            else:
                colour = source[left + x, y]
            pixels[x, y] = colour
    return out


def spike_of(up):
    pixels = up.load()
    return {
        (x - SPIKE_TIP, y): pixels[x, y]
        for y, (first, last) in SPIKE_ROWS.items()
        for x in range(first, last + 1)
    }


def raise_spikes(grate, spike, drop):
    pixels = grate.load()
    for tip in TIPS:
        for (dx, y), colour in spike.items():
            x, row = tip + dx - PANEL['left'], y + drop
            if row <= SLOT_FLOOR and 0 < x < grate.width - 1:
                pixels[x, row] = colour


def puff(grate, warn):
    """the warning's dust, paler than the sand it rises over and rimmed, so it reads against the
    road and the sky behind"""
    dust = warn.crop((PANEL['left'], 0, PANEL['right'] + 1, DUST_ROWS))
    pixels = dust.load()
    painted = {(x, y) for x in range(dust.width) for y in range(dust.height) if pixels[x, y][3]}
    for x, y in painted:
        pixels[x, y] = DUST.get(pixels[x, y][:3], DUST_SHADE)
    for x, y in painted:
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            inside = 0 <= nx < dust.width and 0 <= ny < dust.height
            if inside and (nx, ny) not in painted:
                pixels[nx, ny] = DUST_RIM
    grate.alpha_composite(dust, (0, DUST_DROP))


def main(source, out):
    baked = Image.open(source).convert('RGBA')
    tiles = [baked.crop((i * FRAME, 0, (i + 1) * FRAME, HEIGHT)) for i in range(PHASES)]
    spike = spike_of(tiles[UP])
    frames = []
    for phase in range(PHASES):
        frame = sunk_grate(tiles[REST])
        if phase == WARN:
            puff(frame, tiles[WARN])
        if phase in DROPS:
            raise_spikes(frame, spike, DROPS[phase])
        frames.append(frame)
    strip = Image.new('RGBA', (frames[0].width * PHASES, frames[0].height))
    for phase, frame in enumerate(frames):
        strip.paste(frame, (phase * frame.width, 0))
    strip.save(out)


if __name__ == '__main__':
    main(*sys.argv[1:])
