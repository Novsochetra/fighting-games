"""Folds in the Blue Shade's cape: lines hanging from its back edge, a set distance in from it on
every row, so they swing with the cloth instead of lying still under it as it moves."""
import numpy as np
from .paint import box, interior
from .blue_palette import ABYSS, DEEP, NAVY

# (where a fold starts down the cape, its distance from the back edge there, and at the hem)
FOLDS = ((0.3, 3, 5), (0.45, 6, 11))
FOLD_CLEARANCE = 2
FOLD_REACH = 3
# a fold rises out of the black, dark at its top and lit by the frost as it nears the hem
FOLD_SHADES = ((0.15, ABYSS), (0.75, NAVY), (1.0, DEEP))


def back_runs(cloth):
    runs = {}
    for y in range(cloth.shape[0]):
        xs = np.flatnonzero(cloth[y])
        if len(xs) == 0 or (xs[0] > 0 and cloth[y, xs[0] - 1]):
            continue
        breaks = np.flatnonzero(np.diff(xs) > 1)
        runs[y] = (xs[0], xs[breaks[0]] if len(breaks) else xs[-1])
    return runs


def fold_points(runs, top, bottom, fold):
    start, near, far = fold
    points = []
    for y, (back_x, front_x) in sorted(runs.items()):
        down = (y - top) / max(1, bottom - top)
        x = back_x + int(round(near + (far - near) * down))
        if down >= start and x <= front_x - FOLD_CLEARANCE:
            points.append((x, y))
    return points


def shade_of(line):
    ys = np.nonzero(line)[0]
    shades = [np.zeros_like(line) for _ in FOLD_SHADES]
    if len(ys) == 0:
        return shades
    along = (np.arange(line.shape[0])[:, None] - ys.min()) / max(1, ys.max() - ys.min())
    below = np.full(line.shape, -1.0)
    for shade, (until, _) in zip(shades, FOLD_SHADES):
        shade |= line & (along > below) & (along <= until)
        below = np.full(line.shape, until)
    return shades


# a fold is one pixel a row; where the back edge steps out further than that, the row is joined
# to the one above so the line never breaks
def joined(points, shape):
    line = np.zeros(shape, bool)
    for (last_x, last_y), (x, y) in zip([(None, None)] + points[:-1], points):
        line[y, x] = True
        if last_y == y - 1 and abs(x - last_x) <= FOLD_REACH:
            step = 1 if x > last_x else -1
            line[y, last_x + step:x:step] = True
    return line


def fold_shades(parts):
    cape = parts['cape']
    bounds = box(cape)
    shades = [np.zeros_like(cape) for _ in FOLD_SHADES]
    if bounds is None:
        return shades
    runs = back_runs(cape)
    for fold in FOLDS:
        line = joined(fold_points(runs, bounds[0], bounds[1], fold), cape.shape) & interior(cape)
        for shade, part in zip(shades, shade_of(line)):
            shade |= part
    return shades


def dress_folds(frame, parts, paint_cloth):
    for mask, (_, color) in zip(fold_shades(parts), FOLD_SHADES):
        paint_cloth(frame, mask, color)
