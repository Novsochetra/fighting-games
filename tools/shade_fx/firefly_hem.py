"""Sparks lifting off the hem of the Firefly Shade's cloak and drifting up behind him."""
import math
import numpy as np
from . import particles
from .firefly_flock import draw_flock, spawn
from .firefly_palette import GLOW, GLOW_DIM, LIME, SPARK, TRAIL_FADE

LONGEST = 6


# the lowest pixels of the cloak's back half, below his middle and clear of his legs, so no spark
# starts out in the gap between cloak and boot
def hem_of(frame):
    scene = frame.extra['firefly']
    centre_x, centre_y = scene.centre
    below = np.zeros_like(frame.body)
    below[:-1] = frame.body[1:]
    hem = frame.body & ~below & scene.cloth & ~scene.legs
    hem[:, int(centre_x):] = False
    hem[:int(centre_y)] = False
    return particles.points_of(hem)


# a spark trails one pixel of fading light back along the way it rises, and dims to firefly green
# as it goes out: a lone dim gold pixel read as a speck of dust
def ember_looks(vx, vy):
    speed = math.hypot(vx, vy)
    tail = (int(round(-vx / speed)), int(round(-vy / speed)))
    return [
        [(*tail, GLOW_DIM), (0, 0, SPARK)],
        [(*tail, TRAIL_FADE), (0, 0, GLOW)],
        [(0, 0, LIME)],
    ]


def make_ember(rng, x, y, birth):
    vx, vy = float(rng.uniform(-0.9, -0.3)), float(rng.uniform(-1.1, -0.5))
    return particles.Particle(
        birth=birth, life=int(rng.integers(4, LONGEST)), x=x - 1, y=y - 1, vx=vx, vy=vy,
        looks=ember_looks(vx, vy), sway=float(rng.uniform(0.4, 0.9)), period=5.0,
        phase=float(rng.uniform(0, 2 * math.pi)), behind=True)


def shed_from_hem(frames):
    rng = particles.generator('firefly', frames[0].strip, 'hem')
    draw_flock(frames, spawn(frames, rng, hem_of, make_ember, 1, LONGEST), spaced=True)

