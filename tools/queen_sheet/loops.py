"""Hold the Scorpion Queen's body still through her idle, walk and charge loops."""

import numpy as np

from pixel_art import glowing, to_lab

# ChatGPT redrew her whole body in every pose of a loop, so a loop played back shimmers; each loop
# keeps its first pose's body. Her walk and charge put each pose's own legs under it; her idle
# keeps the first pose whole, and only her venom pulses. A sprite has no layers, so lifting part
# of her body to breathe stretched a row somewhere: a leg kinked, an outline thickened or her hair
# smeared, wherever the line ran
SPLIT = 128
LOOPS = {
    'idle': {'frames': 4, 'legs': False, 'glow': [0, 1, 2, 1]},
    'walk': {'frames': 8, 'legs': True},
    'charge': {'frames': 8, 'legs': True},
}
# a pose's legs are drawn a pixel or three off her body, and in a shape of their own: they are
# moved under the body, then joined to it along the path through her waist where the two agree
SHIFT = 4
ABOVE, BELOW = 6, 14
CLEAR_AGAINST_DRAWN = 4000.0
VIVID = 60


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


def pulsed(frame, level, palette):
    # each venom color steps up the venom ramp by the level, so the glow brightens and fades; a
    # dull olive the shrink left in the sting stays as it is, or stepping onto it muddies the glow
    lab = to_lab(palette.astype(np.float64))
    glow = glowing(lab) & (np.hypot(lab[:, 1], lab[:, 2]) >= VIVID)
    glow[0] = False
    ramp = sorted(np.nonzero(glow)[0], key=lambda index: lab[index, 0])
    table = np.arange(len(palette))
    for rank, index in enumerate(ramp):
        table[index] = ramp[min(rank + level, len(ramp) - 1)]
    return table[frame].astype(frame.dtype)


def steadied(frames, loop, palette):
    first = frames[0]
    held = []
    for index, frame in enumerate(frames):
        body = first.copy()
        if loop['legs']:
            body = joined(body, under_body(body, frame, palette), palette)
        if 'glow' in loop:
            body = pulsed(body, loop['glow'][index], palette)
        held.append(body)
    return held
