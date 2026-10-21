"""Where the swarm gathers: round the Firefly Shade's body, and on his ultimate's last frames round
the tip of the blade he raises, drawing in tight as it rises to it.
"""
import numpy as np

# how far the swarm still spreads on each closing frame of the ultimate, 1 being round his body
GATHER = {6: 0.5, 7: 0.32, 8: 0.25}
BELOW_TIP = 3
HOOD_SHARE = 0.2
HOOD_CLEAR = 3


def blade_tip(frame):
    centre_x = frame.extra['firefly'].centre[0]
    lit = frame.glow | frame.smear
    lit[:, :int(centre_x)] = False
    ys, xs = np.nonzero(lit)
    if len(ys) == 0:
        return None
    top = ys.min()
    return float(xs[ys == top].mean()), float(top)


def swarm_targets(frames):
    targets = []
    for frame in frames:
        x, y = frame.extra['firefly'].centre
        target = (x, y, 1.0)
        tip = blade_tip(frame) if frame.strip == 'ult' and frame.index in GATHER else None
        if tip is not None:
            target = (tip[0], tip[1] + BELOW_TIP, GATHER[frame.index])
        targets.append(target)
    return targets


# drawn in round his raised blade, none of the swarm hangs over his hood: the top fifth of him, the
# air above it, and a firefly's glow either side of it
def over_hood(frame, spot):
    if frame.strip != 'ult' or frame.index not in GATHER:
        return False
    top, bottom, _, _ = frame.extra['firefly'].box
    foot = top + int(HOOD_SHARE * (bottom - top))
    columns = np.nonzero(frame.body[top:foot + 1].any(axis=0))[0]
    x, y = spot
    if len(columns) == 0 or y > foot:
        return False
    return columns.min() - HOOD_CLEAR <= x <= columns.max() + HOOD_CLEAR
