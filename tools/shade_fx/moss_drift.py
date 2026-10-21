"""The moss Shade's few leaves and spores laid over his strip: born on his cloak's hem, each fading
out before it would cross the frame's one-pixel margin, come near his head or drift too far from
him."""
import numpy as np
from scipy import ndimage as nd
from . import particles
from .moss_shape import FEET_Y
from .moss_spores import STRAY, hem_points, leaf, spore
from .paint import shifted

LONGEST = 7
# a speck this near his cloak's top edge, with none of him above it, sticks up off it
ATOP = 3
# (kind, how it is made, where it is born, births a frame, born every that many frames)
KINDS = [('leaf', leaf, hem_points, 1, 3), ('spore', spore, hem_points, 1, 3)]


def inside(look, x, y, size):
    height, width = size
    for dx, dy, _ in look:
        px, py = int(round(x + dx)), int(round(y + dy))
        if not (1 <= px <= width - 2 and 1 <= py <= min(height - 2, FEET_Y)):
            return False
    return True


def frame_at(frames, particle, age):
    index = particle.birth + age
    if frames[0].loops:
        return index % frames[0].count
    return index if 0 <= index < frames[0].count else None


def fits_at(particle, age, frames, distance, stray):
    look = particles.look_at(particle, age)
    if look is None:
        return True
    x, y = particles.position(particle, age)
    if not inside(look, x, y, frames[0].sword.shape[:2]):
        return False
    index = frame_at(frames, particle, age)
    if index is None:
        return True
    yi, xi = int(round(y)), int(round(x))
    return distance[index][yi, xi] <= stray


# shortening a life squeezes its looks into fewer frames, so it is checked again until it holds
def settled(particle, frames, distance, stray):
    while particle.life > 0:
        failing = [age for age in range(particle.life)
                   if not fits_at(particle, age, frames, distance, stray)]
        if not failing:
            break
        particle.life = failing[0]
    return particle


# how far each pixel lies from him; his head, the air over it and the top of his cloak count as out
# of reach
def far_from(shape):
    # lying on the ground (the game holds these frames) nothing drifts off him to hang frozen in the air
    if shape.lying:
        return np.full(shape.hero.shape, np.inf)
    away = shape.guard | atop(shape.hero)
    return np.where(away, np.inf, nd.distance_transform_edt(~shape.hero))


# just over his outline with none of him higher up: a speck there sticks up off his cloak's top edge
def atop(hero, reach=ATOP):
    below = np.zeros_like(hero)
    for step in range(1, reach + 1):
        below |= shifted(hero, 0, -step)
    return below & ~np.logical_or.accumulate(hero, axis=0)


def spores(frames, shapes):
    shape_at = dict(zip((frame.index for frame in frames), shapes))
    longest = min(LONGEST, frames[0].count) if frames[0].loops else LONGEST
    distance = [far_from(shape) for shape in shapes]
    found = []
    for kind, make, points, per_frame, every in KINDS:
        rng = particles.generator('moss', frames[0].strip, kind)
        born = particles.spawn(frames, rng, lambda frame: points(frame, shape_at[frame.index]),
                               lambda rng, x, y, birth: make(rng, x, y, birth, longest),
                               per_frame, longest)
        found += [settled(particle, frames, distance, STRAY[kind])
                  for particle in born if particle.birth % every == 0]
    particles.draw(frames, found)
