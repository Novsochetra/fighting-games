"""The lit line down the front of the Blue Shade's mask, where a side view draws his face as no
more than that: found from the top of the lit pixels in his hood and followed down to his chin,
keeping to the front of the face. blue_profile.py gives it his chin and eye."""
import numpy as np
from .paint import box

# the line runs this many rows down the face, leaning no further than this along its length
SHORTEST_LINE, LONGEST_LINE, MOST_LEAN = 3, 10, 2
WHITE = 150
# the hood's black and its darkest outline; as his head bobs down into his collar the collar's dark
# top row lies where the chin runs, so the chin runs over it too
DARKEST_HOOD, DARKEST_COLLAR = 64, 96
# the lit face under a front view's line lies this near its foot
FACE_BELOW = 3


def at(mask, x, y):
    return 0 <= y < mask.shape[0] and 0 <= x < mask.shape[1] and bool(mask[y, x])


def masks_of(sword, glow):
    solid = sword[..., 3] > 0
    lit = glow & (sword[..., :3].min(-1) < WHITE)
    brightest = sword[..., :3].max(-1)
    return {'lit': lit, 'air': ~solid, 'dark': solid & ~lit & (brightest < DARKEST_HOOD),
            'collar': solid & ~lit & (brightest < DARKEST_COLLAR)}


def run_back(lit, x, y):
    while at(lit, x - 1, y):
        x -= 1
    return x


# a pixel of the line has the dark face behind its run, and nothing lit in front of it: the hood's
# dark rim, a dim fold of it under the chin, or open air
def on_line(masks, x, y):
    lit = masks['lit']
    return at(lit, x, y) and at(masks['dark'], run_back(lit, x, y) - 1, y) and not at(lit, x + 1, y)


# down the line from its top, a row at a time, keeping to its front and to the box round his head
def traced(masks, guard, top):
    _, bottom_y, left_x, right_x = box(guard)
    line = [top]
    while len(line) < LONGEST_LINE and line[-1][1] < bottom_y:
        x, y = line[-1]
        step = next((nx for nx in (x + 1, x, x - 1)
                     if left_x <= nx <= right_x and on_line(masks, nx, y + 1)), None)
        if step is None:
            break
        line.append((step, y + 1))
    return line


# where the frame drew the chin itself, the line steps back under the face at its foot
def drawn_chin(line):
    end = len(line)
    while end > 1 and line[end - 1][0] < line[end - 2][0]:
        end -= 1
    return line[:end], line[end:]


# a front view's line meets the lit face below it, which reaches further forward than the line
def ends_at_chin(masks, line):
    x, y = line[-1]
    ahead = np.flatnonzero(masks['lit'][y + 1]) if y + 1 < masks['lit'].shape[0] else []
    return not any(x_ahead > max(point[0] for point in line) for x_ahead in ahead
                   if abs(x_ahead - x) <= FACE_BELOW)


# the face's line starts at the top of the lit pixels in his hood
def face_line(masks, head, guard):
    starts = sorted(zip(*np.nonzero(masks['lit'] & head)), key=lambda point: (point[0], -point[1]))
    for y, x in starts:
        if not on_line(masks, x, y):
            continue
        line = traced(masks, guard, (x, y))
        straight, _ = drawn_chin(line)
        xs = [point[0] for point in line]
        lean = max(xs) - min(xs)
        if len(straight) >= SHORTEST_LINE and lean <= MOST_LEAN and ends_at_chin(masks, line):
            return line
    return None
