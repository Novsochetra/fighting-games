"""Moss on the moss Shade's shoulder, where his design wears it: the clump of moss on his front
shoulder plate, just under his hood, grown a pixel thicker in the design's dark greens with one
olive tip. It is found by the plate's own olive moss, so it rides his shoulder however he moves,
and is left alone on a frame that hides the plate."""
import numpy as np
from scipy import ndimage as nd
from .moss_head import HOOD_DEPTH, hood_axes
from .moss_palette import DEEP, MID, MOSS, OLIVE
from .paint import CROSS, hashed, hsv

# his plate's moss lies this far under his hood's crown at most
PLATE_TO = HOOD_DEPTH + 9
EIGHT = np.ones((3, 3), bool)
# the share of the plate's new moss that is mid-dark, and of that the share lit a little brighter
MOSS_SHARE, MID_SHARE = 0.45, 0.15
# his plate lies behind his hood's line or just under it; olive this far in front of that line is a
# blade's dark edge lying by him or the cloth under his chin as he hunches, never his shoulder
IN_FRONT = 3


def own_moss(sword):
    hue, sat, val = hsv(sword)
    return (sword[..., 3] > 0) & (hue >= 60) & (hue <= 115) & (sat >= 0.4) & (val >= 0.22) \
        & (val <= 0.62)


# the biggest clump of olive moss under his hood: his front shoulder plate
def plate_of(shape, sword):
    depth, _ = hood_axes(shape.hero.shape, shape.anchor, shape.down)
    moss = own_moss(sword) & shape.hero & ~shape.guard & (depth <= PLATE_TO)
    labels, count = nd.label(nd.binary_dilation(moss, structure=EIGHT), structure=EIGHT)
    if count == 0:
        return None
    sizes = np.bincount(labels[moss], minlength=count + 1)
    sizes[0] = 0
    return moss & (labels == int(np.argmax(sizes)))


# each new moss pixel's colour is picked by where it lies on the plate, so it holds still with him
def colour_at(x, y, middle):
    pick = hashed(int(round(x - middle[0])), int(round(y - middle[1])), 4)
    if pick < MID_SHARE * MOSS_SHARE:
        return MID
    return MOSS if pick < MOSS_SHARE else DEEP


# the one olive tip: the top of the plate's new moss, toward his back
def tip_of(rim, shape):
    depth, side = hood_axes(shape.hero.shape, shape.anchor, shape.down)
    ys, xs = np.nonzero(rim)
    best = np.argmin(depth[ys, xs] - 0.5 * side[ys, xs])
    return ys[best], xs[best]


def in_front(rim, shape):
    _, side = hood_axes(shape.hero.shape, shape.anchor, shape.down)
    return side[rim].max() < -IN_FRONT


def shoulders(overlay, shape, sword, cloth):
    plate = plate_of(shape, sword)
    if plate is None:
        return
    ys, xs = np.nonzero(plate)
    middle = xs.mean(), ys.mean()
    rim = nd.binary_dilation(plate, structure=CROSS) & cloth & ~shape.guard & ~plate
    if not rim.any() or in_front(rim, shape):
        return
    for y, x in zip(*np.nonzero(rim)):
        overlay[y, x] = colour_at(x, y, middle)
    overlay[tip_of(rim, shape)] = OLIVE
