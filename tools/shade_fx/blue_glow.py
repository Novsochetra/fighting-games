"""The Blue Shade's own light turned to ice: a glint on every armour seam, the blade cold white,
warm eyes turned to ice and a soft bloom round whatever glows at the edge of him, his face under the
hood otherwise left as drawn (blue_head.py)."""
import numpy as np
from scipy import ndimage as nd
from .paint import EIGHT, hsv, outer_ring, paint_behind, ramp_by_light
from .blue_cape import black_of
from .blue_palette import BLOOM, FROST, ICY_EYE_CUTS, ICY_EYES, MASK_EDGE, PALE

SHORTEST_SEAM = 3
LIGHTEST_WHITE = 200
HOOD_DEPTH = 12
# share of black in the 5x5 round a pixel that puts it inside the hood
HOODED = 0.4


def whites_of(img):
    return (img[..., 3] > 0) & (img[..., :3].min(-1) >= LIGHTEST_WHITE)


# a weapon row shares the sword row's pixels except where its own weapon is drawn, so a pixel is
# recoloured in a row only where that row still shows what the sword row did
def unchanged(row, sword):
    return (row == sword).all(-1)


# light catches each seam at its top, the end nearest the hero's front; the mask's lit edge in the
# hood is no seam
def glints_of(seams, head):
    labels, count = nd.label(seams, structure=EIGHT)
    glints = np.zeros_like(seams)
    for label in range(1, count + 1):
        ys, xs = np.nonzero(labels == label)
        if len(ys) < SHORTEST_SEAM or head[ys, xs].any():
            continue
        first = np.lexsort((-xs, ys))[0]
        glints[ys[first], xs[first]] = True
    return glints


def under_hood(frame):
    hood = np.zeros_like(frame.glow)
    ys = np.nonzero(frame.extra['cape']['cape'])[0]
    if len(ys) > 0:
        hood[ys.min():ys.min() + HOOD_DEPTH] = True
    return hood


# a few frames give the hero warm eyes, deep in the hood's black: they turn to ice
def warm_eyes(frame, sword):
    hue, sat, val = hsv(sword)
    warm = (sword[..., 3] > 0) & ((hue < 50) | (hue > 340)) & (sat > 0.25) & (val > 0.4)
    hooded = nd.uniform_filter(black_of(sword).astype(float), size=5) >= HOODED
    return warm & hooded & under_hood(frame)


# the blade the other weapons' rows take away leaves a few pixels of its edge by the hand: no glint
# on them, and no bloom laid where the blade was, or its ghost would glow on in those rows
def seams_of(frame):
    blade = frame.glow & ~frame.body
    return frame.glow & frame.body & ~nd.binary_dilation(blade, structure=EIGHT)


# a white stripe drawn on his armour (down his thigh as he thrusts) is no blade: the bladeless row
# keeps it as drawn, with all that lies round it, and it is lit in his armour's own blue, with no bloom
def armour_whites(whites, sword, bladeless, head):
    if bladeless is None:
        return np.zeros_like(whites)
    kept = unchanged(bladeless, sword)
    labels, count = nd.label(whites & kept & ~head, structure=EIGHT)
    stripes = np.zeros_like(whites)
    for label in range(1, count + 1):
        stripe = labels == label
        if kept[outer_ring(stripe, True)].all():
            stripes |= stripe
    return stripes


def dress_glow(frame, sword, bladeless=None):
    same = [unchanged(row, sword) for row in frame.rows]
    head, guard = frame.extra['cape']['head'], frame.extra['cape']['guard']
    whites = whites_of(sword)
    armour = armour_whites(whites, sword, bladeless, head)
    eyes = warm_eyes(frame, sword)
    painted = ramp_by_light(sword, eyes, ICY_EYES, ICY_EYE_CUTS)
    painted[glints_of(seams_of(frame), head)] = PALE
    painted[whites] = FROST
    painted[armour] = MASK_EDGE
    shines = frame.glow | whites
    blooming = shines & ~nd.binary_dilation(armour, structure=EIGHT)
    open_air = (sword[..., 3] == 0) & ~guard
    for row, keep in zip(frame.rows, same):
        row[(shines | eyes) & keep] = painted[(shines | eyes) & keep]
        paint_behind(row, outer_ring(blooming & keep) & open_air, BLOOM)
