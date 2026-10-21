"""The light the Khmer fighters stand in on their select cards, drawn into the card frames.

Gold sparks rise off both fighters' blades and now and then one twinkles; lotus petals tumble down
past the Angkor Warrior's shoulders. Every particle is drawn only on empty pixels, from a seeded
generator, and its age wraps round the loop, so the last frame runs into the first; the drawn
frames themselves are left as they are.
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shade_fx.frames import Frame  # noqa: E402
from shade_fx.paint import hue_mask, hx  # noqa: E402
from shade_fx.particles import Particle, draw, generator, points_of, spawn  # noqa: E402

SPARK = [hx('#fff2c4'), hx('#ffd25a'), hx('#c9952e')]
PETAL = [hx('#ffb7c9'), hx('#f29ab2'), hx('#b0607a')]
LONGEST = 6
# a fighter's shoulders stand about this far over his feet on his card frames
SHOULDER_HEIGHT = 46


def card_frames(images):
    count = len(images)
    empty = np.zeros(images[0].shape[:2], bool)
    return [Frame(strip='card', index=index, count=count, loops=True, rows=[image],
                  body=image[..., 3] > 0, glow=empty, smear=empty)
            for index, image in enumerate(images)]


def dot(color):
    return [(0, 0, color)]


def cross(core, arm):
    return [(0, 0, core), (1, 0, arm), (-1, 0, arm), (0, 1, arm), (0, -1, arm)]


# the bright gold of the blade, the only gold on either fighter that is this pale
def blade_points(frame):
    return points_of(hue_mask(frame.rows[0], 38, 62, min_sat=0.2, min_val=0.88))


def shoulder_points(frame):
    ys, xs = np.nonzero(frame.body)
    feet = xs[ys >= ys.max() - 3]
    centre = int((feet.min() + feet.max()) / 2)
    top = ys.max() - SHOULDER_HEIGHT
    return [(x, top) for x in range(centre - 22, centre + 6)]


def spark(rng, x, y, birth):
    looks = [[(0, 0, SPARK[0]), (0, 1, SPARK[1])], dot(SPARK[0]), dot(SPARK[1]), dot(SPARK[2])]
    return Particle(birth=birth, life=4, x=x + int(rng.integers(-2, 3)), y=y - 2,
                    vx=float(rng.uniform(-0.6, 0.6)), vy=float(rng.uniform(-2.2, -1.5)),
                    looks=looks, sway=0.5, period=4.0, phase=float(rng.uniform(0, 6.3)), behind=True)


def twinkle(rng, x, y, birth):
    looks = [dot(SPARK[1]), cross(SPARK[0], SPARK[1]), dot(SPARK[0]), dot(SPARK[2])]
    return Particle(birth=birth, life=4, x=x + int(rng.integers(-5, 6)), y=y - int(rng.integers(3, 7)),
                    vx=0.0, vy=-0.4, looks=looks, behind=True)


# a petal tumbles as it falls, its long side turning from flat to upright and back
def petal(rng, x, y, birth):
    flat = [(0, 0, PETAL[0]), (1, 0, PETAL[1]), (-1, 0, PETAL[2])]
    upright = [(0, 0, PETAL[0]), (0, 1, PETAL[1]), (0, -1, PETAL[2])]
    leaning = [(0, 0, PETAL[1]), (1, 1, PETAL[0]), (-1, -1, PETAL[2])]
    return Particle(birth=birth, life=6, x=x, y=y - int(rng.integers(0, 6)), vx=-0.6, vy=1.7,
                    looks=[flat, leaning, upright, leaning, flat, dot(PETAL[2])],
                    sway=1.5, period=6.0, phase=float(rng.uniform(0, 6.3)), behind=True)


def every(step, particles):
    return [particle for particle in particles if particle.birth % step == 0]


def blade_light(frames, rng):
    sparks = spawn(frames, rng, blade_points, spark, 2, LONGEST)
    return sparks + every(2, spawn(frames, rng, blade_points, twinkle, 1, LONGEST))


def bokator(frames):
    return blade_light(frames, generator('bokator', 'card'))


def angkor(frames):
    rng = generator('angkor', 'card')
    return blade_light(frames, rng) + every(3, spawn(frames, rng, shoulder_points, petal, 1, LONGEST))


def dress(hero, images):
    frames = card_frames([image.copy() for image in images])
    draw(frames, {'bokator': bokator, 'angkor': angkor}[hero](frames))
    return [frame.rows[0] for frame in frames]
