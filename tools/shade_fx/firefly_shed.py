"""The trailing edge of the Firefly Shade's cloak comes apart into fireflies that flicker off behind
him, the way the Ember Shade's cloak breaks into embers.
"""
import math
from . import particles
from .firefly_flock import draw_flock, spawn
from .firefly_palette import GLOW, GLOW_DIM, LIME, SPARK, WHITE_HOT
from .paint import rows_between, side_edge

PER_FRAME = 5
LIFE = (3, 7)
LONGEST = 7
# from his shoulders down to the hem
EDGE_TOP = 0.28
EDGE_BOTTOM = 0.97
# the brightest ages draw a pixel of tail behind the firefly
TAILED = (WHITE_HOT, SPARK, GLOW)
# each age a firefly brightens, dims or blinks out (None) as it flies; it goes out green, since a
# lone dim gold pixel read as a speck of dust
FLICKERS = (
    (WHITE_HOT, GLOW, LIME, None, LIME, None),
    (SPARK, None, GLOW, LIME, None, None),
    (GLOW, SPARK, LIME, None, LIME, None),
)


# the cloak's back-facing edge in his back half, clear of his legs and boots
def back_edge_of(frame):
    scene = frame.extra['firefly']
    top, bottom = scene.box[0], scene.box[1]
    edge = side_edge(frame.body, -1, 0) & scene.cloth & ~scene.legs
    edge[:, int(scene.centre[0]):] = False
    span = bottom - top
    edge = rows_between(edge, top + int(EDGE_TOP * span), top + int(EDGE_BOTTOM * span))
    return particles.points_of(edge)


def flicker_looks(rng, vx, vy):
    speed = math.hypot(vx, vy)
    tail = (int(round(-vx / speed)), int(round(-vy / speed)))
    looks = []
    for color in FLICKERS[int(rng.integers(len(FLICKERS)))]:
        if color is None:
            looks.append(None)
        elif any(color is tailed for tailed in TAILED):
            looks.append([(*tail, GLOW_DIM), (0, 0, color)])
        else:
            looks.append([(0, 0, color)])
    return looks


def make_flier(rng, x, y, birth):
    vx, vy = float(rng.uniform(-1.4, -0.5)), float(rng.uniform(-0.7, 0.15))
    return particles.Particle(
        birth=birth, life=int(rng.integers(*LIFE)), x=x - 1, y=y, vx=vx, vy=vy,
        looks=flicker_looks(rng, vx, vy), sway=float(rng.uniform(0.2, 0.7)), period=4.0,
        phase=float(rng.uniform(0, 2 * math.pi)), behind=True)


def shed_from_edge(frames):
    rng = particles.generator('firefly', frames[0].strip, 'edge')
    flock = spawn(frames, rng, back_edge_of, make_flier, PER_FRAME, LONGEST)
    draw_flock(frames, flock, spaced=True)
