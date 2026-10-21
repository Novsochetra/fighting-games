"""The moss Shade's head on a frame: his hood and the black face in it, which no effect touches, and
the way his body runs from it, so his shoulders can be found just under it however he is turned."""
import numpy as np
from scipy import ndimage as nd

# his hood reaches this far from its crown toward his body, and this far either side of that line
HOOD_DEPTH, HOOD_HALF = 12.5, 10
# his body's mass this near his crown tells which way is down for him, upright, tumbling or lying
MASS_REACH = 14
# effects stay this far off his hood, and off the air over its crown
GUARD_GAP, GUARD_ABOVE = 2, 8


def down_of(hero, anchor):
    ys, xs = np.nonzero(hero)
    near = np.hypot(xs - anchor[0], ys - anchor[1]) <= MASS_REACH
    step = np.array([xs[near].mean() - anchor[0], ys[near].mean() - anchor[1]])
    length = np.hypot(*step)
    return step / length if length > 0 else np.array([0.0, 1.0])


# (depth below his crown along his body, sideways off that line) for every pixel of the frame
def hood_axes(size, anchor, down):
    ys, xs = np.mgrid[0:size[0], 0:size[1]]
    across, along = xs - anchor[0], ys - anchor[1]
    return across * down[0] + along * down[1], across * -down[1] + along * down[0]


def head_of(hero, anchor):
    down = down_of(hero, anchor)
    depth, side = hood_axes(hero.shape, anchor, down)
    head = hero & (depth >= -1) & (depth <= HOOD_DEPTH) & (np.abs(side) <= HOOD_HALF)
    over = (depth < 0) & (depth >= -GUARD_ABOVE) & (np.abs(side) <= HOOD_HALF + GUARD_GAP)
    guard = nd.binary_dilation(head, iterations=GUARD_GAP) | over
    return head, guard, down
