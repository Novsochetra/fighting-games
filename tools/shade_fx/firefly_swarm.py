"""The swarm: fireflies circling the Firefly Shade, pulsing as they fly.

A few fireflies share each orbit, evenly spaced. On a looping strip each orbit turns one spacing per
loop, so every firefly ends the loop where the next one began, and since a firefly's brightness
follows where it is on its orbit, the last frame runs into the first with nothing jumping. The
swarm's centre lags behind the hero's, so on a lunge or a swing it streams along after him. Where
two fireflies would meet, the later one is pushed out from the swarm's centre until it is clear.
"""
import math
from .firefly_clock import beat_of, loop_of, shown_before
from .firefly_light import cores_of, crowded, firefly_look, stamp_whole
from .firefly_orbits import GROUND, ORBITS, SURGE, angle_of, angle_step, level_at, spot_on
from .firefly_ult import over_hood, swarm_targets

LAG = 0.55
PATH_SAMPLES = 12
FADES = {'ko': {2: 1, 3: 1}}
# how far round the near side of its ring a firefly must be to pass in front of him
IN_FRONT = 0.25
# how near two fireflies' cores may come, so their glows never touch, and how far one is pushed
GAP = 5.0
FARTHEST_PUSH = 6


# as he falls for good the swarm dims round him
def fading(frame):
    return FADES.get(frame.strip, {}).get(frame.index, 0)


def lerp(start, end, share):
    return tuple(now + share * (then - now) for now, then in zip(start, end))


# the swarm's centre on each frame, by frame index: round the loop until it settles, and on a frame
# between two beats, between where it is on those beats
def lagged_anchors(frames):
    targets = dict(zip((frame.index for frame in frames), swarm_targets(frames)))
    loop = loop_of(frames)
    anchor = targets[loop[0].index]
    anchors = {}
    for _ in range(3 if frames[0].loops else 1):
        for frame in loop:
            anchor = lerp(anchor, targets[frame.index], LAG)
            anchors[frame.index] = anchor
    for frame in frames:
        if frame.index not in anchors:
            last, back = shown_before(frames, frame)
            following = loop[(int(beat_of(frame).at) + 1) % len(loop)]
            anchors[frame.index] = lerp(anchors[last.index], anchors[following.index], back)
    return anchors


# pushed a pixel at a time, out from the swarm's centre first, then along its way round or in, until
# no firefly is that near; one with no room anywhere near blinks out on that frame
def spaced_out(frame, spot, anchor):
    out_x, out_y = spot[0] - anchor[0], spot[1] - anchor[1]
    length = math.hypot(out_x, out_y) or 1.0
    out_x, out_y = out_x / length, out_y / length
    ways = ((out_x, out_y), (-out_y, out_x), (out_y, -out_x), (-out_x, -out_y))
    for push in range(FARTHEST_PUSH + 1):
        for way_x, way_y in ways:
            moved = (spot[0] + push * way_x, min(spot[1] + push * way_y, GROUND))
            if not (crowded(frame, moved, GAP) or over_hood(frame, moved)):
                return moved
    return None


# `before` is the frame shown just before this one and how many beats back it is
def fly(frame, firefly, anchors, before):
    orbit, slot = firefly
    last, back = before
    angle = angle_of(orbit, slot, frame)
    anchor = anchors[frame.index]
    path = flown(orbit, angle, back * angle_step(orbit, frame), (anchors[last.index], anchor))
    front = not orbit.behind and math.sin(angle) > IN_FRONT
    look = firefly_look(level_at(orbit, angle) - fading(frame), path)
    spot = spaced_out(frame, spot_on(orbit, angle, anchor), anchor)
    if spot is not None and stamp_whole(frame, spot, look, front):
        cores_of(frame).append(spot)


# the way it came since the last frame, as offsets back from where it is now, nearest first
def flown(orbit, angle, step, anchors):
    last, anchor = anchors
    here = spot_on(orbit, angle, anchor)
    path = []
    for i in range(1, PATH_SAMPLES + 1):
        back = i / PATH_SAMPLES
        x, y = spot_on(orbit, angle - back * step, lerp(anchor, last, back))
        path.append((x - here[0], y - here[1]))
    return path


def fly_swarm(frames):
    anchors = lagged_anchors(frames)
    orbits = ORBITS + (SURGE if frames[0].strip == 'ult' else ())
    for frame in frames:
        before = shown_before(frames, frame)
        for orbit in orbits:
            for slot in range(orbit.flies):
                fly(frame, (orbit, slot), anchors, before)
