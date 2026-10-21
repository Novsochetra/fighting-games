"""Laying firefly light into every weapon row of a frame, the same in each.

A firefly behind the Shade shows only on empty pixels; one in front of him also covers the body
pixels his Scene leaves open. A firefly whose shape would touch the frame's outermost pixels is not
drawn at all, so none is ever cut in half by the frame's edge. Where each firefly's core is drawn is
noted on the frame, so the next one can keep its distance.
"""
import math
from .firefly_palette import LEVELS

MARGIN = 1
SHORTEST_TRAIL = 2.0
CROSS_ARMS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def inside(frame, x, y):
    width = frame.rows[0].shape[1]
    return MARGIN <= x < width - MARGIN and MARGIN <= y < frame.height - MARGIN


# `pixel` is (x, y, color)
def shows(row, scene, pixel, front):
    x, y, color = pixel
    alpha = row[y, x, 3]
    if alpha == 0:
        return not scene.nook[y, x]
    return color[3] == 255 and (alpha < 255 or (front and scene.open[y, x]))


def light(frame, pixel, front=False):
    x, y, color = pixel
    for row in frame.rows:
        if shows(row, frame.extra['firefly'], pixel, front):
            row[y, x] = color


# a look lists its core last; a firefly whose core is hidden behind him hides its glow and trail
# too, so no stray bit of it is left in sight. Tells whether it showed in any row
def stamp_whole(frame, spot, look, front=False):
    x, y = int(round(spot[0])), int(round(spot[1]))
    pixels = [(x + dx, y + dy, color) for dx, dy, color in look]
    if not pixels or not all(inside(frame, px, py) for px, py, _ in pixels):
        return False
    scene = frame.extra['firefly']
    drawn = False
    for row in frame.rows:
        if not shows(row, scene, pixels[-1], front):
            continue
        drawn = True
        for pixel in pixels:
            if shows(row, scene, pixel, front):
                row[pixel[1], pixel[0]] = pixel[2]
    return drawn


def cores_of(frame):
    return frame.extra.setdefault('firefly_cores', [])


def crowded(frame, spot, gap):
    return any(math.dist(spot, core) < gap for core in cores_of(frame))


# the way back along a straight flight in half-pixel steps, as far as it flew but at least past
# the glow round the core
def straight_path(velocity):
    speed = math.hypot(*velocity)
    if speed < 0.5:
        return []
    unit_x, unit_y = velocity[0] / speed, velocity[1] / speed
    steps = [0.6 + 0.5 * i for i in range(int(2 * max(SHORTEST_TRAIL, speed)))]
    return [(-unit_x * step, -unit_y * step) for step in steps]


# the trail lies along the way the firefly came, from just past the glow round its core, a pixel
# per color, so it is as long as the flight and curves as the flight curved
def trail_of(path, colors, taken):
    trail = []
    for back_x, back_y in path:
        if len(trail) == len(colors):
            break
        spot = (int(round(back_x)), int(round(back_y)))
        if spot not in taken:
            taken.add(spot)
            trail.append((spot[0], spot[1], colors[len(trail)]))
    return trail


def firefly_look(level, path=()):
    if level < 1:
        return []
    core, arms, trail_colors = LEVELS[min(level, max(LEVELS))]
    taken = {(0, 0)}
    glow = []
    if arms is not None:
        glow = [(dx, dy, arms) for dx, dy in CROSS_ARMS]
        taken |= set(CROSS_ARMS)
    trail = trail_of(path, trail_colors, taken)
    return trail[::-1] + glow + [(0, 0, core)]

