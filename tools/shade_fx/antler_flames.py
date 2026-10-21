"""Ghost flames licking up off the Antler Spirit Shade's antler tips.

The antlers are the thin brown prongs at the top of his hood; a prong's tip is the top of a column
that stands higher than the ones beside it with antler just under it. A flame of two to five pixels
burns palest at the tip and darkest at its top, leans back the way his cloak streams, and takes a
new shape every frame.
"""
import numpy as np
from scipy import ndimage as nd
from .paint import EIGHT, box, hsv
from .particles import generator
from .antler_palette import DEEP, GLOW, MID, PALE, TEAL, WHITE

BAND = 12
REACH = 4
CROWN = 6
# how far round a tip its antler's brown shows
PRONG = 3
MOST = 3
# a flame's colors from its root up, by how tall it burns
FLAMES = {
    2: [GLOW, MID],
    3: [PALE, TEAL, MID],
    4: [PALE, GLOW, TEAL, DEEP],
    5: [WHITE, PALE, TEAL, MID, DEEP],
}


def antler_mask(frame):
    hue, sat, val = hsv(frame.sword)
    brown = (hue >= 15) & (hue <= 45) & (sat >= 0.18) & (sat <= 0.55)
    brown &= (val >= 0.12) & (val <= 0.45)
    cover = nd.uniform_filter(frame.body.astype(float), size=5, mode='constant')
    thin = frame.body & brown & (cover <= 0.6)
    thin[box(frame.body)[0] + BAND:] = False
    return thin


def column_tops(body, columns):
    return {x: int(np.nonzero(body[:, x])[0].min()) for x in columns if body[:, x].any()}


# a prong's tip is a column standing higher than its neighbours, with antler right under it; a
# flat top counts once, and a tip the blade or its smear sweeps past burns no flame to hide them
def antler_tips(frame):
    antler = antler_mask(frame)
    near = nd.binary_dilation(antler, EIGHT, iterations=PRONG)
    tops = column_tops(frame.body, sorted(set(np.nonzero(near)[1].tolist())))
    swung = nd.binary_dilation(frame.glow | frame.smear, EIGHT, iterations=2)
    tips = []
    for x, y in tops.items():
        left, right = tops.get(x - 1, 99), tops.get(x + 1, 99)
        prong = antler[y:y + PRONG, x - PRONG:x + PRONG + 1].any()
        if y < left and y <= right and prong and not swung[y - 1, x]:
            tips.append((x, y))
    return highest_of(tips, box(frame.body)[0])


# tips well under the highest, or under the top of his figure, are a hood's edge or a shoulder
def highest_of(tips, top):
    if not tips:
        return []
    highest = min(y for _, y in tips)
    kept = [tip for tip in tips if tip[1] <= highest + REACH and tip[1] <= top + CROWN]
    return sorted(kept, key=lambda tip: tip[1])[:MOST]


# a flame's pixels from its root up: a column that leans back near its top, a little wider at the
# root when it burns tall, and now and then a scrap torn off above it
def flame_shape(rng, tall):
    lean = int(rng.choice([-1, -1, 0, 0, 1]))
    bend = tall - int(rng.integers(1, 3))
    shape = [(lean if rise >= bend else 0, -1 - rise, color) for rise, color in enumerate(FLAMES[tall])]
    if tall >= 4:
        shape.append((int(rng.choice([-1, 1])), -1, TEAL))
    if rng.random() < 0.35:
        shape.append((lean, -2 - tall - int(rng.integers(0, 2)), DEEP))
    return shape


def burn_tip(frame, rng, tip):
    x, y = tip
    tall = int(min(rng.integers(2, 6), y - 3))
    if tall < 2:
        return
    shape = [(dx, dy, color) for dx, dy, color in flame_shape(rng, tall) if y + dy >= 2]
    for row, bare in zip(frame.rows, frame.extra['bare']):
        if bare[y, x]:
            row[y, x] = MID
        for dx, dy, color in shape:
            if row[y + dy, x + dx, 3] == 0:
                row[y + dy, x + dx] = color


def burn_antlers(frame):
    rng = generator('antler', frame.strip, 'flame', frame.index)
    for tip in antler_tips(frame):
        burn_tip(frame, rng, tip)
