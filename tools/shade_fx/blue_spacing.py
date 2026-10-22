"""The Blue Shade's ice motes kept apart: shed close together, or drifting into one another, they would
run together into a clump of light, and against his outline or each other shut specks of open air in."""
import numpy as np
from .blue_glow import SPECK
from .particles import look_at, position

# open pixels kept between two motes, diagonals too, and round a mote catching the light as a cross,
# which would otherwise read as one shape with a mote beside it
MOTE_GAP, TWINKLE_GAP = 1, 2
SIDES = ((1, 0), (-1, 0), (0, 1), (0, -1))


def frame_index(frames, moment):
    count = frames[0].count
    if frames[0].loops:
        return moment % count
    return moment if 0 <= moment < count else None


# a mote is drawn behind him, so only the pixels of it in the open, in any of his rows, count
def open_air(frame):
    return np.any([row[..., 3] == 0 for row in frame.rows], axis=0)


def cells_of(mote, age, air):
    x, y = position(mote, age)
    look = look_at(mote, age)
    gap = TWINKLE_GAP if len(look) > 1 else MOTE_GAP
    height, width = air.shape
    cells = [(int(round(x + dx)), int(round(y + dy))) for dx, dy, _ in look]
    return [(cell_x, cell_y, gap) for cell_x, cell_y in cells
            if 0 <= cell_x < width and 0 <= cell_y < height and air[cell_y, cell_x]]


def twinkles(mote):
    return any(len(look) > 1 for look in mote.looks)


def crowded(taken, cells):
    return any(max(abs(x - other_x), abs(y - other_y)) <= max(gap, other_gap)
               for x, y, gap in cells for other_x, other_y, other_gap in taken)


# the open air left round (x, y) once the motes are drawn, counted only as far as a speck's size;
# none if (x, y) is not open, and more than a speck once it reaches the frame's edge
def pocket_size(air, motes, x, y):
    height, width = air.shape
    pocket, todo = set(), [(x, y)]
    while todo and len(pocket) <= SPECK:
        point = todo.pop()
        if point in pocket or point in motes:
            continue
        if not (0 <= point[0] < width and 0 <= point[1] < height):
            return SPECK + 1
        if air[point[1], point[0]]:
            pocket.add(point)
            todo.extend((point[0] + dx, point[1] + dy) for dx, dy in SIDES)
    return len(pocket)


def shuts_air(air, taken, cells):
    motes = {(x, y) for x, y, _ in taken + cells}
    return any(0 < pocket_size(air, motes, x + dx, y + dy) <= SPECK
               for x, y, _ in cells for dx, dy in SIDES)


# a mote is gone from the moment it comes within the gap of one placed before it or would shut air
# in, so none blinks out and back again; one that twinkles is placed first, its cross the rarer sight
def spaced(frames, motes):
    air = [open_air(frame) for frame in frames]
    taken = [[] for _ in frames]
    for mote in sorted(motes, key=lambda mote: (not twinkles(mote), mote.birth)):
        for age in range(mote.life):
            index = frame_index(frames, mote.birth + age)
            if index is None:
                continue
            cells = cells_of(mote, age, air[index])
            if crowded(taken[index], cells) or shuts_air(air[index], taken[index], cells):
                mote.looks = mote.looks[:age] + [None] * (len(mote.looks) - age)
                break
            taken[index].extend(cells)
    return motes
