"""Moss growing on the moss Shade, as his design has it: a thicker clump on his shoulder plate,
and his cloak's trailing part (behind his legs, below his waist or streaming far back) going dark
green at its edge, the lower or further back the more, with dark mossy strands off its hem."""
import numpy as np
from scipy import ndimage as nd
from .moss_lumps import hanging_lumps, lumps
from .moss_palette import BLACK, DARK, DEEP
from .moss_shape import FEET_Y, depth_toward, pattern
from .moss_shoulder import shoulders
from .paint import hsv

LEG_ROWS = 4
FAR_BEHIND = 16
# how thick the moss grows on a cloak lying flat: thin, under the weight a cloak sheds leaves from
LYING_MOSS = 0.4
CREEP_COLOURS = [None, BLACK, DEEP, DARK]


# cloth: the dark, colourless pixels of his hood and cloak, not his hands, trim or leafy pauldron
def cloth_of(frame, shape):
    _, sat, val = hsv(frame.sword)
    return shape.hero & (val < 0.2) & (sat < 0.35) & ~frame.glow & ~frame.smear


# his legs are what reaches his lowest rows; the cloak trails behind them. A blade's thin dark edge
# can reach lower than his feet, so only his solid parts count. Tumbling or lying, his cloak is what
# reaches lowest, yet its back edge still trails
def legs_from(shape):
    solid = nd.binary_opening(shape.hero, structure=np.ones((3, 3), bool))
    if not solid.any():
        solid = shape.hero
    bottom = np.nonzero(solid.any(axis=1))[0][-1]
    feet = np.nonzero(solid[bottom - LEG_ROWS + 1:bottom + 1].any(axis=0))[0]
    return max(feet.min() - 1, shape.left + 1)


# how far each pixel lies into the trailing cloak, 0 to 1, and where that cloak is
def trailing(shape):
    ys, xs = np.mgrid[0:shape.hero.shape[0], 0:shape.hero.shape[1]]
    lower = np.clip((ys - shape.waist) / max(1, FEET_Y - 10 - shape.waist), 0, 1)
    further = np.clip((shape.anchor[0] - FAR_BEHIND - xs) / 10, 0, 1)
    room = (xs < legs_from(shape)) & (ys <= FEET_Y - 4) & ((ys > shape.waist) | (further > 0))
    if shape.lying and not (room & shape.hero).any():
        return lying_cloak(shape, further)
    return room & ~shape.guard, np.where(room, np.maximum(lower, further), 0)


# lying flat, his cloak spreads out on the ground behind his head and takes a little moss
def lying_cloak(shape, further):
    room = (further > 0) & ~shape.guard
    return room, np.where(room, LYING_MOSS * further, 0)


def edge_depth(hero):
    return np.minimum.reduce([depth_toward(hero, -1, 0, 4), depth_toward(hero, 0, 1, 4),
                              depth_toward(hero, 0, -1, 4)])


# dark moss creeps a pixel or two in from the trailing cloak's edge in soft clumps
def creeping_moss(shape, overlay, cloth, trail, weight):
    size = cloth.shape
    reach = pattern(shape, size, 4, 6) * 1.2 + weight * 2.2
    clumps = (pattern(shape, size, 2, 7) - 0.5) * 1.6
    level = (reach - edge_depth(shape.hero) + clumps).astype(int)
    level = np.clip(level, 0, len(CREEP_COLOURS) - 1)
    for step, colour in enumerate(CREEP_COLOURS):
        if colour is not None:
            overlay[cloth & trail & (level == step)] = colour


# the lumps of his hem that hang a strand on a frame
def hem_lumps(frame, shape):
    return hanging_lumps(shape, cloth_of(frame, shape), *trailing(shape))


def growth(frame, shape, keep=()):
    overlay = np.zeros(shape.hero.shape + (4,), np.uint8)
    cloth = cloth_of(frame, shape)
    trail, weight = trailing(shape)
    creeping_moss(shape, overlay, cloth, trail, weight)
    lumps(overlay, shape, cloth, trail, weight, keep)
    shoulders(overlay, shape, frame.sword, cloth)
    overlay[shape.guard] = 0
    return overlay
