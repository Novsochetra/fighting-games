"""Loose fireflies and sparks born on the Firefly Shade's frames, timed by the beats of his loops.

A particle is born on a whole beat of the loop and ages with it, so the win strip's loop of three
beats wraps as the game plays it, and its first frame shows each particle half a beat on.
"""
import math
from . import particles
from .firefly_clock import age_at, loop_of
from .firefly_light import cores_of, crowded, stamp_whole

# how near the bright heads of two loose particles may come
GAP = 5.0
# and how near a lone dim speck may come to any other: a row of them along the cloak's underside, or
# a dozen at its hem, read as a smear of light, not as fireflies
SPECK_GAP = 4.0


# the beats a particle can be born on, each with the frame it is born on; on a strip that plays
# once, particles born before its first frame are already under way when it starts
def births(frames, longest):
    if frames[0].loops:
        return list(enumerate(loop_of(frames)))
    return [(birth, frames[max(0, birth)]) for birth in range(-(longest - 1), len(frames))]


# `per_frame` births a beat; `emitter(frame)` gives the (x, y) points a particle can start from,
# `make(rng, x, y, birth)` builds one
def spawn(frames, rng, emitter, make, per_frame, longest):
    flock = []
    for birth, frame in births(frames, longest):
        points = emitter(frame)
        if len(points) == 0:
            continue
        for _ in range(per_frame):
            x, y = points[rng.integers(len(points))]
            flock.append(make(rng, x, y, birth))
    return flock


def look_at(particle, age):
    step = min(len(particle.looks) - 1, int(age * len(particle.looks) // particle.life))
    return particle.looks[step]


def specks_of(frame):
    return frame.extra.setdefault('firefly_specks', [])


def too_near(frame, spot, head):
    if head:
        return crowded(frame, spot, GAP)
    near_speck = any(math.dist(spot, speck) < SPECK_GAP for speck in specks_of(frame))
    return near_speck or crowded(frame, spot, SPECK_GAP)


# where a firefly's bright head is drawn is noted, so the swarm keeps clear of it; in a `spaced` flock
# a head that would come within GAP of one already drawn, or a lone dim speck within SPECK_GAP of any,
# blinks out on that frame, since sparks shed off a short cloak edge bunched into a blob of light
def draw_flock(frames, flock, spaced=False):
    for frame in frames:
        for particle in flock:
            age = age_at(frame, particle.birth)
            if not 0 <= age < particle.life:
                continue
            look = look_at(particle, age)
            spot = particles.position(particle, age)
            head = look is not None and len(look) > 1
            if look is None or (spaced and too_near(frame, spot, head)):
                continue
            if stamp_whole(frame, spot, look, front=not particle.behind):
                (cores_of(frame) if head else specks_of(frame)).append(spot)
