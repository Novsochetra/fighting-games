"""The Firefly Shade's eye where the scene cannot find it: a hilt's glint above his hood turned
away, or the hood's dim edge in a front view whose whole face glows, was taken for his eye and lit
as a second one."""
import numpy as np

# (strip, frame): the eye's pixels, or none where his face is turned away or glows whole
EYES_BY_HAND = {
    ('air_slash', 2): [],
    ('air_slash', 3): [],
    ('spin_slash', 3): [],
    ('spin_slash', 4): [],
    ('spin_slash', 5): [],
}


def eyes_by_hand(frame):
    if (frame.strip, frame.index) not in EYES_BY_HAND:
        return None
    eyes = np.zeros(frame.body.shape, bool)
    for x, y in EYES_BY_HAND[(frame.strip, frame.index)]:
        eyes[y, x] = True
    return eyes
