"""Loose bits that drift off a Shade: embers, spores, sparks, wisps, frost.

A particle is born on a frame, at a point an emitter picks on that frame's hero, and lives a few
frames. On a looping strip its age wraps round the loop, so the last frame runs into the first with
nothing popping in or out; on a strip that plays once, particles born before its first frame are
already under way when it starts. Everything comes from a seeded generator, so a re-bake draws the
same frames.
"""
from dataclasses import dataclass
import math
import zlib
import numpy as np
from .paint import stamp


@dataclass
class Particle:
    birth: int
    life: int
    x: float
    y: float
    vx: float
    vy: float
    # a list per age step of [(dx, dy, color)], the shape it draws at that age; None skips that age
    looks: list
    ax: float = 0.0
    ay: float = 0.0
    sway: float = 0.0
    period: float = 6.0
    phase: float = 0.0
    behind: bool = False


def generator(*keys):
    return np.random.default_rng(zlib.crc32('/'.join(map(str, keys)).encode()))


def age_on(particle, frame):
    if frame.loops:
        age = (frame.index - particle.birth) % frame.count
    else:
        age = frame.index - particle.birth
    return age if 0 <= age < particle.life else None


def position(particle, age):
    sway = particle.sway * math.sin(2 * math.pi * age / particle.period + particle.phase)
    x = particle.x + particle.vx * age + 0.5 * particle.ax * age * age + sway
    y = particle.y + particle.vy * age + 0.5 * particle.ay * age * age
    return x, y


def look_at(particle, age):
    step = min(len(particle.looks) - 1, age * len(particle.looks) // particle.life)
    return particle.looks[step]


def birth_frames(frames, longest):
    count = frames[0].count
    if frames[0].loops:
        return list(range(count))
    return list(range(-(longest - 1), count))


# `per_frame` births a frame; `emitter(frame)` gives the (x, y) points a particle can start from,
# `make(rng, x, y, birth)` builds one; a birth before the strip starts uses the first frame's points
def spawn(frames, rng, emitter, make, per_frame, longest):
    particles = []
    for birth in birth_frames(frames, longest):
        points = emitter(frames[max(0, birth) % len(frames)])
        if len(points) == 0:
            continue
        for _ in range(per_frame):
            x, y = points[rng.integers(len(points))]
            particles.append(make(rng, x, y, birth))
    return particles


def draw(frames, particles):
    for frame in frames:
        for particle in particles:
            age = age_on(particle, frame)
            if age is None:
                continue
            look = look_at(particle, age)
            if look is None:
                continue
            x, y = position(particle, age)
            for row in frame.rows:
                stamp(row, x, y, look, particle.behind)


def points_of(mask):
    ys, xs = np.nonzero(mask)
    return list(zip(xs.tolist(), ys.tolist()))
