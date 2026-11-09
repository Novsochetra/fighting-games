"""Paints hair drawn as clumps: polygons in pixel coordinates, later ones in front. Each clump is lit
as one plane from the upper left (light, base and dark tones across it), creased in the darkest
tone where a clump in front meets it, and outlined outside the whole shape so a spike's tip keeps
its colour. A sheen of the lightest tone runs across the crown, broken where it leaves a clump's lit plane."""

from render import HEIGHT, WIDTH

LIT, DARK = 0.62, 0.3
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


def tone(x, y, box):
    left, right, top, bottom = box
    light = 1 - ACROSS * (x - left) / max(right - left, 1) - DOWN * (y - top) / max(bottom - top, 1)

    return 'H' if light > LIT else ('h' if light > DARK else 'g')


def creased(owner, x, y):
    return any(owner.get((x + dx, y + dy), -1) > owner[(x, y)] for dx, dy in NEIGHBOURS)


def painted(clumps, sheen):
    owner = owners(clumps)
    boxes = bounds(owner)
    rows = [['.'] * WIDTH for _ in range(HEIGHT)]

    for (x, y), index in owner.items():
        rows[y][x] = 'g' if creased(owner, x, y) else tone(x, y, boxes[index])

        if (x, y) in sheen and rows[y][x] in 'Hh':
            rows[y][x] = 'J'

    for x, y in owner:
        for dx, dy in NEIGHBOURS:
            if (x + dx, y + dy) not in owner:
                rows[y + dy][x + dx] = 'o'

    return [''.join(row) for row in rows]
