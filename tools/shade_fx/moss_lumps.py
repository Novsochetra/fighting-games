"""Dark mossy strands off the moss Shade's cloak, as his design's hem breaks into them: hanging off
its hem, and a short tuft off its trailing back edge here and there.

Strands come in lumps a few pixels wide with a bare notch between, counted along a line of his
outline from his hood, so they keep their place as he moves."""
import numpy as np
from .moss_palette import BLACK, DARK, DEEP, MOSS
from .moss_shape import FEET_Y
from .paint import hashed

LUMP_WIDTHS = (3, 2, 4, 3, 2, 4, 2, 3)
BACK, DOWN = (-1, 0), (0, 1)
HANGING = [DARK, DEEP, DEEP, BLACK]
TUFT = [MOSS]
# a hem's trim runs this many pixels under its cloth
HEM_TRIM = 3


# the lump a step along a line falls in and the step's place in it; None for the notch between
def lump_at(index, widths=LUMP_WIDTHS):
    lap, rest = divmod(index, sum(width + 1 for width in widths))
    for number, width in enumerate(widths):
        if rest < width:
            return lap * len(widths) + number, rest, width
        if rest == width:
            return None
        rest -= width + 1
    return None


def back_line(shape, cloth, trail):
    for y in range(shape.top, FEET_Y - 3):
        xs = np.nonzero(shape.hero[y])[0]
        if len(xs) and trail[y, xs[0]] and cloth[y, xs[0]]:
            yield xs[0], y, y - shape.anchor[1]


# a strand hangs off cloth at the hem's lowest pixel; a strand kept from the frames either side
# may hang off the cloak's trim or a dark fleck there too, as long as cloth lies just above it
def hem_line(shape, cloth, trail, keep=()):
    for x in range(shape.left, shape.right + 1):
        ys = np.nonzero(shape.hero[:, x])[0]
        if not len(ys) or not trail[ys[-1], x]:
            continue
        index = shape.anchor[0] - x
        kept = lump_of(index) in keep and cloth[ys[-1] - HEM_TRIM:ys[-1], x].any()
        if cloth[ys[-1], x] or kept:
            yield x, ys[-1], index


def lump_of(index):
    place = lump_at(index)
    return None if place is None else place[0]


def strong(lump, salt, boost):
    return hashed(lump, salt, 7) * 0.6 + boost > 0.72


# a strand grows out past his outline from the middle of a strong lump, darkening to its tip
def strand(overlay, shape, x, y, out, colours):
    for step, colour in enumerate(colours, 1):
        px, py = x + out[0] * step, y + out[1] * step
        if shape.hero[py, px] or shape.guard[py, px] or py > FEET_Y - 3 or px < 1:
            return
        overlay[py, px] = colour


# the middle of every strong lump along a line, where its strand grows: (x, y, lump)
def strands_on(line, out, boost):
    for x, y, index in line:
        place = lump_at(index)
        if place is None:
            continue
        lump, step, width = place
        if strong(lump, out[0] * 3 + out[1], boost(y, x)) and step == width // 2:
            yield x, y, lump


def hem_boost(weight):
    return lambda y, x: 0.35 + 0.4 * weight[y, x]


def hanging_lumps(shape, cloth, trail, weight):
    line = hem_line(shape, cloth, trail)
    return {lump for _, _, lump in strands_on(line, DOWN, hem_boost(weight))}


def lumps(overlay, shape, cloth, trail, weight, keep=()):
    back = strands_on(back_line(shape, cloth, trail), BACK, lambda y, x: 0.5 * weight[y, x])
    for x, y, _ in back:
        strand(overlay, shape, x, y, BACK, TUFT)
    hem = strands_on(hem_line(shape, cloth, trail, keep), DOWN, hem_boost(weight))
    for x, y, lump in hem:
        strand(overlay, shape, x, y, DOWN, HANGING[:2 + int(hashed(lump, 3, 1) * 3)])
