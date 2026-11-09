"""Paints hair drawn as locks: polygons in pixel coordinates, later ones in front. Each lock is lit
from the upper left (a light rim where its edge faces the light, its base colour, its dark side
toward the lower right) and outlined against the background and the locks behind it."""

import numpy as np

from letters import EMPTY, OUTLINE


def inside(polygon, xs, ys):
    """Which pixel centres lie inside a polygon, by the even-odd rule."""
    result = np.zeros(xs.shape, bool)
    points = list(polygon)

    for (x1, y1), (x2, y2) in zip(points, points[1:] + points[:1]):
        crosses = (y1 > ys) != (y2 > ys)
        at_x = (x2 - x1) * (ys - y1) / np.where(y2 - y1 == 0, 1e-9, y2 - y1) + x1
        result ^= crosses & (xs < at_x)

    return result


def owners(locks, width, height):
    ys, xs = np.mgrid[0:height, 0:width] + 0.5
    owner = np.full((height, width), -1)

    for index, lock in enumerate(locks):
        owner[inside(lock['points'], xs, ys)] = index

    return owner


def outlined(owner):
    height, width = owner.shape
    padded = np.pad(owner, 1, constant_values=-1)
    line = np.zeros(owner.shape, bool)

    for dy, dx in ((0, 1), (2, 1), (1, 0), (1, 2)):
        near = padded[dy:dy + height, dx:dx + width]
        line |= (owner >= 0) & (near < 0)

    return line


def creased(owner):
    """Pixels of a lock that touch a lock drawn in front of it: a dark crease, not an outline."""
    height, width = owner.shape
    padded = np.pad(owner, 1, constant_values=-1)
    crease = np.zeros(owner.shape, bool)

    for dy, dx in ((0, 1), (2, 1), (1, 0), (1, 2)):
        near = padded[dy:dy + height, dx:dx + width]
        crease |= (owner >= 0) & (near > owner)

    return crease


def shade(owner, line, locks, sheen, crease):
    height, width = owner.shape
    padded = np.pad(owner, 2, constant_values=-1)
    letters = np.full(owner.shape, EMPTY, dtype='<U1')

    for y in range(height):
        for x in range(width):
            index = owner[y, x]

            if index < 0:
                continue

            if line[y, x]:
                letters[y, x] = OUTLINE
                continue

            letters[y, x] = 'g' if crease[y, x] else lock_shade(padded, x + 2, y + 2, index, locks[index], sheen)

    return letters


LIGHT = np.array([-0.7071, -0.7071])


def axis_sides(lock):
    """How far each point sits toward the lit side of a lock, across the line from its middle to its
    tip, scaled to -1 (dark side) .. 1 (lit side)."""
    points = np.array(lock['points'], float)
    centre = points.mean(axis=0)
    tip = points[np.argmax(np.linalg.norm(points - centre, axis=1))]
    axis = (tip - centre) / max(np.linalg.norm(tip - centre), 1e-6)
    normal = np.array([-axis[1], axis[0]])
    normal = normal if normal @ LIGHT > 0 else -normal
    reach = max(abs((points - centre) @ normal).max(), 1e-6)

    return lambda x, y: float((np.array([x + 0.5, y + 0.5]) - centre) @ normal) / reach


def lock_shade(padded, x, y, index, lock, sheen):
    if (x - 2, y - 2) in sheen and lock.get('sheen', True):
        return 'J'

    if padded[y + 1, x + 1] != index or padded[y + 1, x] != index:
        return 'g'

    if 'side' in lock:
        side = lock['side'](x - 2, y - 2)

        return 'H' if side > 0.62 else ('g' if side < -0.55 else 'h')

    if padded[y - 1, x - 1] != index and padded[y - 1, x] != index and lock.get('rim', True):
        return 'H'

    return 'h'


def band(centre, radii, thickness, right_of=None, left_of=None):
    """The anime sheen: an arc of pixels around `centre`, `thickness` thick, on its upper half, cut
    to the columns between `right_of` and `left_of` when they are given."""
    cx, cy = centre
    pixels = set()

    for y in range(int(cy - radii[1] - thickness - 2), int(cy + 1)):
        for x in range(int(cx - radii[0] - thickness - 2), int(cx + radii[0] + thickness + 3)):
            distance = np.hypot((x + 0.5 - cx) / radii[0], (y + 0.5 - cy) / radii[1])

            inside_columns = (right_of is None or x > right_of) and (left_of is None or x < left_of)

            if 1 <= distance <= 1 + thickness / radii[1] and inside_columns:
                pixels.add((x, y))

    return pixels


def paint(locks, width, height, sheen=frozenset()):
    locks = [{**lock, 'side': axis_sides(lock)} if index and lock.get('axis', True) else lock
             for index, lock in enumerate(locks)]
    owner = owners(locks, width, height)

    return shade(owner, outlined(owner), locks, sheen, creased(owner))
