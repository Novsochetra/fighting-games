"""What drifts off the moss Shade: now and then a small dark leaf shaken loose from his cloak's
mossy hem, falling slowly back and down with a sway, and the odd dim spore."""
import numpy as np
from scipy import ndimage as nd
from . import particles
from .moss_growth import trailing
from .moss_palette import BLACK, DEEP, DIM, MID, MOSS
from .paint import outer_ring
from .particles import Particle

SHEDS_FROM = 0.45
# a particle that has drifted this far from him fades out early: further off, a dark speck on a sand
# backdrop reads as dirt, not as moss shed off his cloak
STRAY = {'spore': 3, 'leaf': 3}
LEAF_TURNS = [
    [(0, 0, DEEP), (1, 0, MID)],
    [(0, 0, DEEP), (1, -1, MOSS)],
    [(0, 0, DEEP), (1, 0, MID)],
    [(0, -1, DEEP), (1, 0, MOSS)],
]
LEAF_FALLEN = [(0, 0, BLACK), (1, 0, DEEP)]


# leaves and spores shake loose where the cloak trails most: its hem and its streaming tip
def hem_points(frame, shape):
    trail, weight = trailing(shape)
    ring = outer_ring(shape.hero) & nearby(trail & shape.hero & (weight >= SHEDS_FROM))
    return particles.points_of(ring & (frame.sword[..., 3] == 0) & ~shape.guard)


def nearby(mask):
    return nd.binary_dilation(mask, structure=np.ones((3, 3), bool))


def spore(rng, x, y, birth, longest):
    looks = [[(0, 0, DIM)], [(0, 0, DIM)], [(0, 0, MOSS)], [(0, 0, DEEP)]]
    return Particle(birth, int(rng.integers(4, longest + 1)), x - rng.uniform(0.5, 1.5), y,
                    rng.uniform(-0.8, -0.4), rng.uniform(-0.15, 0.2), looks,
                    sway=rng.uniform(0.4, 0.8), period=rng.uniform(5, 8),
                    phase=rng.uniform(0, 6.3), behind=True)


def leaf(rng, x, y, birth, longest):
    turn = int(rng.integers(len(LEAF_TURNS)))
    looks = LEAF_TURNS[turn:] + LEAF_TURNS[:turn] + [LEAF_FALLEN]
    return Particle(birth, longest, x - 2, y, rng.uniform(-0.7, -0.35), rng.uniform(0.2, 0.4),
                    looks, sway=rng.uniform(0.8, 1.3), period=rng.uniform(5, 7),
                    phase=rng.uniform(0, 6.3), behind=True)
