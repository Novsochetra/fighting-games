"""Fireflies resting along the trailing edge and hem of the Firefly Shade's cloak, blinking.

Each keeps its place on the cloak (how far down its back edge, or how far along its hem, and how
far in on the cloth), so it rides the cloak as it sways. It blinks once a loop (once every six
frames on a strip that plays once), and while it glows it lights the cloth round it, or the air
where it sits on the outline.
"""
import math
import numpy as np
from .firefly_clock import beat_of
from .firefly_light import inside, light
from .firefly_palette import CLOAK_LIT, CLOAK_WARM, GLOW, LIME, SPARK, WHITE_HOT

# down the back edge: (0 the hood's top to 1 his feet, pixels in from the edge, when it lights)
ON_BACK = (
    (0.10, 2, 0.4), (0.24, 1, 0.85), (0.36, 0, 0.0), (0.47, 3, 0.55), (0.56, 0, 0.3),
    (0.66, 2, 0.8), (0.76, 0, 0.1),
)
# along the hem: (0 its back tip to 1 his middle, pixels up from the edge, when it lights)
ON_HEM = ((0.1, 0, 0.65), (0.3, 2, 0.35), (0.5, 0, 0.9), (0.72, 1, 0.5))
# deeper in on the cloth, smaller and dimmer: (down him, pixels in from the back edge, when lit)
IN_FOLDS = ((0.42, 7, 0.2), (0.52, 10, 0.7), (0.6, 6, 0.45), (0.7, 9, 0.95), (0.8, 6, 0.6))
CROSS_ARMS = ((1, 0), (-1, 0), (0, 1), (0, -1))
CORNERS = ((1, 1), (-1, 1), (1, -1), (-1, -1))
# what lights up at each brightness: (dx, dy, on the cloth, in the air beside it)
LOOKS = {
    2: [(dx, dy, CLOAK_LIT, None) for dx, dy in CROSS_ARMS] + [(0, 0, SPARK, SPARK)],
    3: [(dx, dy, CLOAK_LIT, None) for dx, dy in CORNERS]
    + [(dx, dy, CLOAK_WARM, GLOW) for dx, dy in CROSS_ARMS] + [(0, 0, WHITE_HOT, WHITE_HOT)],
}
FOLD_LOOKS = {
    2: [(0, 0, LIME, None)],
    3: [(dx, dy, CLOAK_LIT, None) for dx, dy in CROSS_ARMS] + [(0, 0, SPARK, None)],
}


def blink(frame, phase):
    beat = beat_of(frame)
    turn = 2 * math.pi * (beat.at / beat.length + phase)
    return int(round(1.7 + 1.8 * math.cos(turn)))


def on_back(frame, down, inset):
    top, bottom, _, _ = frame.extra['firefly'].box
    y = int(round(top + down * (bottom - top)))
    xs = np.nonzero(frame.body[y])[0]
    return (int(xs.min()) + inset, y) if len(xs) else None


def on_hem(frame, along, inset):
    scene = frame.extra['firefly']
    back = scene.box[2]
    x = int(round(back + along * (scene.centre[0] - back)))
    ys = np.nonzero(frame.body[:, x])[0]
    return (x, int(ys.max()) - inset) if len(ys) else None


def glow_at(frame, spot, look):
    scene = frame.extra['firefly']
    for dx, dy, on_cloth, in_air in look:
        x, y = spot[0] + dx, spot[1] + dy
        if not inside(frame, x, y):
            continue
        color = on_cloth if frame.body[y, x] else in_air
        if color is not None and (scene.open[y, x] or not frame.body[y, x]):
            light(frame, (x, y, color), front=True)


def on_open_cloth(frame, spot):
    if spot is None or not inside(frame, *spot):
        return False
    scene = frame.extra['firefly']
    return scene.cloth[spot[1], spot[0]] and scene.open[spot[1], spot[0]]


def rest_on_cloak(frames):
    places = [(on_back, *place, LOOKS) for place in ON_BACK]
    places += [(on_hem, *place, LOOKS) for place in ON_HEM]
    places += [(on_back, *place, FOLD_LOOKS) for place in IN_FOLDS]
    for frame in frames:
        for find, where, inset, phase, looks in places:
            spot = find(frame, where, inset)
            if on_open_cloth(frame, spot):
                glow_at(frame, spot, looks.get(min(blink(frame, phase), 3), []))
