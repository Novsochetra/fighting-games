"""What drifts off the Antler Spirit Shade: wisps torn from its burning cloak, and soul motes.

A wisp is a short upright streak, palest at its head, that rises off the hottest stretch of the
cloak's back edge and curls away behind him as it fades to dark teal. A soul mote is a soft orb of
light that swells and dims as it drifts up round his back, behind him. A wisp may cross the burning
part of his cloak, which sways back over the air it left a frame before, but nothing else of him.
"""
import math
from scipy import ndimage as nd
from .paint import EIGHT, side_edge
from .particles import Particle, generator, points_of, spawn
from .antler_palette import DEEP, GLOW, HAZE, MID, MIST, PALE, TEAL
from .antler_drift import kept_in


# a wisp's shape as it ages, straight or curling either way, palest at its head
def wisp(curl):
    return [
        [(0, 0, GLOW), (0, 1, TEAL), (curl, 2, MID)],
        [(0, 0, PALE), (curl, 1, TEAL), (curl, 2, DEEP)],
        [(0, 0, TEAL), (curl, 1, MID)],
        [(0, 0, MID), (curl, 1, DEEP)],
        [(0, 0, DEEP)],
    ]


WISPS = [wisp(0), wisp(1), wisp(-1)]


def orb(core, soft):
    return [(0, 0, core), (-1, 0, soft), (1, 0, soft), (0, -1, soft), (0, 1, soft)]


MOTE = [[(0, 0, MID)], [(0, 0, TEAL)], orb(GLOW, MIST), orb(PALE, HAZE), orb(GLOW, MIST),
        [(0, 0, TEAL)], [(0, 0, MID)]]
WISPS_A_FRAME = 3
WISP_LIFE = 5
MOTE_KEPT = 0.5
LONGEST = 7


def lifespan(frames, rng, shortest, longest):
    life = int(rng.integers(shortest, longest + 1))
    return min(life, frames[0].count) if frames[0].loops else life


def wisp_maker(frames):
    def make(rng, x, y, birth):
        return Particle(
            birth=birth, life=lifespan(frames, rng, 4, 6), x=x - 2, y=y - 1,
            vx=-rng.uniform(0.6, 1.0), vy=-rng.uniform(0.7, 1.2),
            looks=WISPS[int(rng.integers(len(WISPS)))],
            sway=rng.uniform(0.6, 1.1), period=rng.uniform(3.5, 5),
            phase=rng.uniform(0, 2 * math.pi))
    return make


def mote_maker(frames):
    def make(rng, x, y, birth):
        return Particle(
            birth=birth, life=lifespan(frames, rng, 5, 7), x=x, y=y,
            vx=-rng.uniform(0.0, 0.5), vy=-rng.uniform(0.5, 1.0), looks=MOTE,
            sway=rng.uniform(0.5, 1.0), period=rng.uniform(5, 8),
            phase=rng.uniform(0, 2 * math.pi), behind=True)
    return make


# wisps leave from the back edge, up and away from a cloak that hangs wider the lower it gets
def wisp_roots(frame):
    return points_of(frame.extra['burning'] & side_edge(frame.body, -1, 0))


# motes hang in the air a few pixels out from the burning part of the cloak
def mote_roots(frame):
    burning = frame.extra['burning']
    near = nd.binary_dilation(burning, EIGHT, iterations=4)
    return points_of(near & ~nd.binary_dilation(frame.body, EIGHT, iterations=2))


# a short loop cuts every wisp's life to its length, so it lets more of them go to keep as many
# in the air as any other strip
def wisps_a_frame(frames):
    lives = min(WISP_LIFE, frames[0].count) if frames[0].loops else WISP_LIFE
    return round(WISPS_A_FRAME * WISP_LIFE / lives)


def drift(frames):
    height = frames[0].height
    rng = generator('antler', frames[0].strip, 'wisps')
    wisps = spawn(frames, rng, wisp_roots, wisp_maker(frames), wisps_a_frame(frames), LONGEST)
    rng = generator('antler', frames[0].strip, 'motes')
    motes = spawn(frames, rng, mote_roots, mote_maker(frames), 1, LONGEST)
    motes = [mote for mote in motes if rng.random() < MOTE_KEPT]
    return kept_in(wisps + motes, height)
