"""Finding the crown of the moss Shade's hood on a frame, the point his head and every moss
pattern are laid from."""
import numpy as np
from .paint import side_edge

HOOD_ROWS = 6
HOOD_WIDTH = 16
# a hood is this wide a few rows under its crown, and narrow just under it; a boot or a cloak's tip
# is not
HOOD_BELOW, HOOD_WIDEST_CROWN, HOOD_NARROWEST = 5, 10, 10
# when his topmost rows are no hood (he tumbles, or his cloak flies up over it) and there is no
# frame before to go by, it is sought from the top front of him, his hood leading as he faces right
FRONT_LEAN = 0.5


def run_width(row, x):
    if not row[x]:
        return 0
    left = x
    while left > 0 and row[left - 1]:
        left -= 1
    right = x
    while right < len(row) - 1 and row[right + 1]:
        right += 1
    return right - left + 1


def hood_like(hero, x, y):
    if y + HOOD_BELOW >= hero.shape[0]:
        return False
    return run_width(hero[y + HOOD_BELOW], x) >= HOOD_NARROWEST


# the front of what reaches his topmost rows: a cloak streaming back as high lies behind his hood
def front_of_top(hero, top):
    _, xs = np.nonzero(hero[top:top + HOOD_ROWS])
    hood = xs[xs >= xs.max() - HOOD_WIDTH]
    return int(round(hood.mean())), int(top)


# as he tumbles his hood is sought nearest where it was the frame before, else at his top front
def sought(hero, before):
    ys, xs = np.nonzero(side_edge(hero, 0, -1))
    if before is None:
        rank = ys - FRONT_LEAN * xs
    else:
        rank = np.hypot(xs - before[0], ys - before[1])
    for i in np.argsort(rank, kind='stable'):
        x, y = int(xs[i]), int(ys[i])
        if hood_like(hero, x, y) and run_width(hero[y + 1], x) <= HOOD_WIDEST_CROWN:
            return x, y
    return None


def crown_of(hero, top, before=None):
    anchor = front_of_top(hero, top)
    if hood_like(hero, *anchor):
        return anchor
    return sought(hero, before) or anchor
