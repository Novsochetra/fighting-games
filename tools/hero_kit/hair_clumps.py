"""Paints hair drawn as clumps: polygons in pixel coordinates, later ones in front. Each clump is lit
from the upper left: a light rim along its upper-left edges, a dark one along the lower right, and
light, base and dark tones across it as one plane, creased in the darkest
tone where a clump in front meets it, and outlined outside the whole shape so a spike's tip keeps
its colour. A band of sheen, lightest tone over a lit one, arcs over the lit side of the crown."""

from render import HEIGHT, WIDTH

LIT, DARK = 0.55, 0.26
ACROSS, DOWN = 0.6, 0.55
NEIGHBOURS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def inside(polygon, px, py):
    result = False

    for (x1, y1), (x2, y2) in zip(polygon, polygon[1:] + polygon[:1]):
        if (y1 > py) != (y2 > py) and px < (x2 - x1) * (py - y1) / (y2 - y1) + x1:
            result = not result

    return result


def owners(clumps):
    owner = {}

    for index, polygon in enumerate(clumps):
        xs, ys = [x for x, _ in polygon], [y for _, y in polygon]

        for y in range(int(min(ys)) - 1, int(max(ys)) + 2):
            for x in range(int(min(xs)) - 1, int(max(xs)) + 2):
                if inside(polygon, x + 0.5, y + 0.5):
                    owner[(x, y)] = index

    return owner


def bounds(owner):
    boxes = {}

    for (x, y), index in owner.items():
        box = boxes.setdefault(index, [x, x, y, y])
        box[:] = [min(box[0], x), max(box[1], x), min(box[2], y), max(box[3], y)]

    return boxes


def tone(owner, x, y, box):
    left, right, top, bottom = box
    light = 1 - ACROSS * (x - left) / max(right - left, 1) - DOWN * (y - top) / max(bottom - top, 1)
    mine = owner[(x, y)]
    lit_side = any(owner.get((x - step, y)) != mine or owner.get((x, y - step)) != mine for step in (1, 2))
    dark_side = owner.get((x + 1, y)) != mine or owner.get((x, y + 1)) != mine

    if lit_side and not dark_side:
        return 'H'

    if dark_side:
        return 'g' if light < LIT else 'h'

    return 'H' if light > LIT else ('h' if light > DARK else 'g')


def creased(owner, x, y):
    return any(owner.get((x + dx, y + dy), -1) > owner[(x, y)] for dx, dy in NEIGHBOURS)


def in_band(x, y, crown, reach):
    across, height = (x + 0.5 - crown[0]) / reach[0], (y + 0.5 - crown[1]) / reach[1]
    distance = (across * across + height * height) ** 0.5

    return y < crown[1] and across < 0.25 and 1 - 2.2 / reach[1] <= distance <= 1


def painted(clumps, crown, reach=(12, 12)):
    owner = owners(clumps)
    boxes = bounds(owner)
    rows = [['.'] * WIDTH for _ in range(HEIGHT)]

    for (x, y), index in owner.items():
        rows[y][x] = 'g' if creased(owner, x, y) else tone(owner, x, y, boxes[index])

        if rows[y][x] != 'g' and in_band(x, y, crown, reach):
            rows[y][x] = 'J' if rows[y][x] == 'H' or in_band(x, y - 1, crown, reach) else 'H'

    for x, y in owner:
        for dx, dy in NEIGHBOURS:
            if (x + dx, y + dy) not in owner:
                rows[y + dy][x + dx] = 'o'

    return [''.join(row) for row in rows]
