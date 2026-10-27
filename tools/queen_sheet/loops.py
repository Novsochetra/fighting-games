"""Hold the Scorpion Queen's body still through her idle, walk and charge loops."""

import numpy as np

# ChatGPT redrew her whole body in every pose of a loop, so a loop played back shimmers; each loop
# keeps its first pose's body, lifted by the bob, over each pose's own legs (the idle over the
# first pose's legs too: she breathes, her legs stay planted)
SPLIT = 128
LOOPS = {
    # she breathes above her back, where the line crosses only upright shapes (the tail rising,
    # her hair, body and arm), which stretch cleanly; her back, legs and pincers stay planted
    'idle': {'bob': [0, 1, 2, 1], 'legs': False, 'split': 112},
    'walk': {'bob': [0, 1, 1, 0, 0, 1, 1, 0], 'legs': True, 'split': SPLIT},
    'charge': {'bob': [0, 1, 1, 0, 0, 1, 1, 0], 'legs': True, 'split': SPLIT},
}
# a pose's legs are drawn a pixel or three off her body, and in a shape of their own: they are
# moved under the body, then joined to it along the path through her waist where the two agree
SHIFT = 4
ABOVE, BELOW = 6, 14
CLEAR_AGAINST_DRAWN = 4000.0


def lifted(frame, bob, split):
    result = frame.copy()
    if bob:
        result[:split - bob] = frame[bob:split]
        # the rows the lift leaves are the first row under the split drawn on up (her back, the
        # sash): whatever was drawn there before (the edge of a hand) has been lifted away with her
        result[split - bob:split] = frame[split]
    return result


def mismatch(body, legs, palette):
    drawn_body, drawn_legs = body > 0, legs > 0
    distance = np.sqrt(((palette[body].astype(float) - palette[legs].astype(float)) ** 2).sum(axis=-1))
    return np.where(drawn_body != drawn_legs, CLEAR_AGAINST_DRAWN, np.where(drawn_body, distance, 0.0))


def under_body(body, legs, palette):
    # sideways only: up or down would lift her feet off the feet line
    band = slice(SPLIT, SPLIT + BELOW)
    shifts = range(-SHIFT, SHIFT + 1)
    best = min(shifts, key=lambda dx: mismatch(body[band], np.roll(legs, dx, axis=1)[band], palette).sum())
    return np.roll(legs, best, axis=1)


def seam(cost):
    rows, columns = cost.shape
    total = cost.copy()
    for x in range(1, columns):
        before = total[:, x - 1]
        best = np.minimum(before, np.minimum(np.roll(before, 1), np.roll(before, -1)))
        best[0] = min(before[0], before[1])
        best[-1] = min(before[-1], before[-2])
        total[:, x] += best
    path = [int(np.argmin(total[:, -1]))]
    for x in range(columns - 1, 0, -1):
        y = path[-1]
        candidates = [row for row in (y - 1, y, y + 1) if 0 <= row < rows]
        path.append(min(candidates, key=lambda row: total[row, x - 1]))
    return path[::-1]


def joined(body, legs, palette):
    top = SPLIT - ABOVE
    path = seam(mismatch(body[top:SPLIT + BELOW], legs[top:SPLIT + BELOW], palette))
    result = body.copy()
    for x, y in enumerate(path):
        result[top + y:, x] = legs[top + y:, x]
    return result


def steadied(frames, loop, palette):
    first = frames[0]
    held = []
    for frame, bob in zip(frames, loop['bob']):
        body = lifted(first, bob, loop['split'])
        if loop['legs']:
            body = joined(body, under_body(body, frame, palette), palette)
        held.append(body)
    return held
