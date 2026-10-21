"""The trailing edge and hem of the Antler Spirit Shade's cloak, burning away into ghost fire.

Where it burns the cloak's green turns to the dark teal of spirit, fold for fold, and its edge is
lit dark teal to pale mint by how hot it burns there; the hottest spots lick out past the edge.
"""
import numpy as np
from scipy import ndimage as nd
from .frames import FW
from .paint import CROSS, EIGHT, box, hsv, hx, luma, side_edge
from .antler_palette import DEEP, GLOW, MID, PALE, TEAL
from .antler_heat import flicker

# the cloak's greens by how light they are, darkest first, and the spirit teal each turns to
SPIRIT = [hx('#05201d'), hx('#08332e'), hx('#0b443e'), DEEP]
SPIRIT_CUTS = [0.12, 0.17, 0.2]
# no color of its own: the pixel keeps its shade of the cloak, in spirit teal
TINT = None
EDGE_FLICKER = 0.35
# the edge burns hot enough to shed wisps here, or wherever it burns hottest when it burns low
BURNING = 0.6
LIT = 0.35
# the rows from his feet down
GROUND = 5
OUTLINE = 0.06
UPRIGHT = 36
KNEE = 12
# by how far in from the burning edge a pixel lies, how hot it must burn to take each color
BURN = [
    [(1.15, PALE), (0.92, GLOW), (0.7, TEAL), (0.5, MID), (0.35, DEEP)],
    [(1.0, MID), (0.75, DEEP), (0.45, TINT)],
    [(1.05, DEEP), (0.6, TINT)],
    [(0.8, TINT)],
    [(1.0, TINT)],
]


# the cloak is his green and the dark outline round it; his legs, drawn in the same green on some
# frames, are not
def cloak_of(frame):
    hue, sat, val = hsv(frame.sword)
    green = frame.body & (hue >= 85) & (hue <= 150) & (sat >= 0.12) & (val >= 0.06) & (val <= 0.5)
    outline = (luma(frame.sword) < OUTLINE) & nd.binary_dilation(green, EIGHT)
    return (green | outline) & frame.body & ~frame.glow & ~legs_of(frame)


# what stands on the ground: every column that reaches his lowest row, up to knee height; a hero
# lying down is all on the ground, and only his cloak lies at his back end
def legs_of(frame):
    top, bottom, _, _ = box(frame.body)
    legs = np.zeros_like(frame.body)
    if bottom - top < UPRIGHT:
        return legs
    legs[bottom - 1:bottom + 1] = frame.body[bottom - 1:bottom + 1]
    for y in range(bottom - 2, bottom - KNEE, -1):
        legs[y] = frame.body[y] & legs[y + 1]
    return legs


# a hem lying along the ground does not burn: flames climb, they do not run along the floor
def trailing_edge(frame, cloak, heat):
    body = frame.body
    streaming = side_edge(body, 0, -1) & (heat >= 0.8)
    hem = side_edge(body, 0, 1)
    hem[frame.height - GROUND:] = False
    return (side_edge(body, -1, 0) | hem | streaming) & cloak


def layers(edge, inside):
    out = np.full(edge.shape, -1)
    ring, seen = edge, edge.copy()
    for depth in range(len(BURN)):
        out[ring] = depth
        ring = nd.binary_dilation(ring, CROSS) & inside & ~seen
        seen |= ring
    return out


def paint_bare(frame, mask, color):
    for row, bare in zip(frame.rows, frame.extra['bare']):
        row[mask & bare] = color


def tint(frame, mask):
    step = np.searchsorted(SPIRIT_CUTS, luma(frame.sword))
    for level, color in enumerate(SPIRIT):
        paint_bare(frame, mask & (step == level), color)


def burn_layer(frame, ring, heat, steps):
    taken = np.zeros_like(ring)
    for least, color in steps:
        hit = ring & (heat >= least) & ~taken
        taken |= hit
        if color is TINT:
            tint(frame, hit)
        else:
            paint_bare(frame, hit, color)


def burn_cloak(frame, heat):
    cloak = cloak_of(frame)
    edge = trailing_edge(frame, cloak, heat)
    depth = layers(edge, cloak)
    flickering = heat + EDGE_FLICKER * flicker(frame)
    for level, steps in enumerate(BURN):
        burn_layer(frame, depth == level, flickering if level == 0 else heat, steps)
    frame.extra['crest'] = edge & side_edge(frame.body, -1, 0) & (heat >= 0.9)
    frame.extra['open'] = cloak & (heat >= LIT)
    hottest = heat[edge].max(initial=0)
    frame.extra['burning'] = edge & (heat >= max(LIT, min(BURNING, hottest - 0.15)))


TONGUE = [(-1, 0, TEAL), (-1, -1, MID), (-2, -2, DEEP)]


# the hottest spots of the back edge lick out past the cloak, up and back
def lick(frame, heat):
    ys, xs = np.nonzero(frame.extra['crest'])
    for y, x in zip(ys, xs):
        reach = 1 if heat[y, x] < 1.05 else 3
        for dx, dy, color in TONGUE[:reach]:
            for row in frame.rows:
                if 0 < x + dx < FW - 1 and 0 < y + dy and row[y + dy, x + dx, 3] == 0:
                    row[y + dy, x + dx] = color
