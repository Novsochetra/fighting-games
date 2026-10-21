"""Where the Blue Shade's hood lies on a frame, so his frost, rim light, motes, mist and bloom keep
off it. Its crown is found at the top front of him, as the moss Shade's is (moss_hood.py); lying on
his front with his cape heaped over his back the heap stands higher than his hood, so lying down it is
only where the glow of his face lies under it. The hood and a guard round it are laid from the crown
along his body (moss_head.py), so it is found upright, leaning, tumbling or lying."""
import numpy as np
from scipy import ndimage as nd
from .frames import without_specks
from .moss_head import head_of as hood_of
from .paint import EIGHT, side_edge

TOP_ROWS, TOP_WIDTH = 6, 16
# a hood is this wide a few rows under its crown, and narrow just under it; a hand or a boot is not
HOOD_BELOW, HOOD_NARROWEST, CROWN_WIDEST = 5, 10, 10
# sought along his outline, his hood leads as he faces right
FRONT_LEAN = 0.5
# he lies down where he is this much wider than tall
LYING = 1.4
WHITE = 150
# the ultimate has no bladeless row: its blade is a white core this big and the glow just round it,
# which can run on into his face as the blade passes it
BLADE_CORE, BLADE_EDGE = 6, 2


def hero_of(frame):
    sword = frame.sword
    whites = (sword[..., 3] > 0) & (sword[..., :3].min(-1) >= WHITE)
    labels, count = nd.label(whites, structure=EIGHT)
    sizes = np.bincount(labels.ravel(), minlength=count + 1)
    sizes[0] = 0
    cores = nd.binary_dilation((sizes >= BLADE_CORE)[labels], structure=EIGHT, iterations=BLADE_EDGE)
    return without_specks(frame.body & ~(cores & (frame.glow | whites)))


def run_width(row, x):
    if not 0 <= x < len(row) or not row[x]:
        return 0
    left, right = x, x
    while left > 0 and row[left - 1]:
        left -= 1
    while right < len(row) - 1 and row[right + 1]:
        right += 1
    return right - left + 1


def hood_like(hero, x, y):
    if y + HOOD_BELOW >= hero.shape[0]:
        return False
    return (run_width(hero[y + HOOD_BELOW], x) >= HOOD_NARROWEST
            and run_width(hero[y + 1], x) <= CROWN_WIDEST)


def front_of_top(hero):
    ys, xs = np.nonzero(hero)
    top = ys.min()
    band = xs[ys < top + TOP_ROWS]
    return int(round(band[band >= band.max() - TOP_WIDTH].mean())), int(top)


def crowns(hero):
    ys, xs = np.nonzero(side_edge(hero, 0, -1))
    order = np.argsort(ys - FRONT_LEAN * xs, kind='stable')
    return [front_of_top(hero)] + [(int(xs[i]), int(ys[i])) for i in order]


def lying(hero):
    ys, xs = np.nonzero(hero)
    return xs.max() - xs.min() > LYING * (ys.max() - ys.min())


def crown_of(hero, glow):
    hoods = [crown for crown in crowns(hero) if hood_like(hero, *crown)]
    if lying(hero):
        hoods = [crown for crown in hoods if (hood_of(hero, crown)[0] & glow).any()] + hoods
    return hoods[0] if hoods else front_of_top(hero)


# the hood itself, and the guard round it and over its crown that every effect keeps out of
def hood_parts(frame):
    hero = hero_of(frame)
    if not hero.any():
        empty = np.zeros_like(hero)
        return empty, empty
    head, guard, _ = hood_of(hero, crown_of(hero, frame.glow))
    return head, guard
