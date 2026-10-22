"""The cold round the Blue Shade: ice motes drifting back off its cape, a few catching the light
as a cross for a moment, and wisps of mist curling low round its feet and hem."""
import numpy as np
from scipy import ndimage as nd
from .particles import Particle, draw, generator, points_of, position, spawn
from .paint import hashed, outer_ring, rows_between
from .blue_palette import BLUE, DEEP, ICE, PALE, WHITE
from .blue_palette import MIST_THICK as THICK, MIST_THIN as THIN
from .blue_spacing import spaced

MOTES_A_FRAME = 4
MOTE_LIFE = (4, 8)
MOTE_LEASH = 11
SHED_JITTER, DRIFT_SPREAD = 1.5, 0.4
LOW_MOTE = 66
TWINKLE_CHANCE = 0.35
MOTE_FADE = (PALE, PALE, ICE, ICE, BLUE, DEEP)
TWINKLE = [(0, 0, WHITE), (-1, 0, ICE), (1, 0, ICE), (0, -1, ICE), (0, 1, ICE)]
WISPS_A_FRAME = 2
WISP_LIFE = (4, 7)
WISP_LEASH = 4
MIST_DEPTH = 6
FEET_DEPTH = 2
# a wisp swells from a puff into a streak, its back end curling up as it thins away
WISP_LOOKS = (
    [(0, 0, THIN), (1, 0, THIN)],
    [(-1, 0, THIN), (0, 0, THICK), (1, 0, THICK), (2, 0, THIN)],
    [(-2, 0, THIN), (-1, 0, THICK), (0, 0, THICK), (1, 0, THICK), (2, 0, THIN)],
    [(-2, -1, THIN), (-1, 0, THIN), (0, 0, THICK), (1, 0, THIN), (2, 0, THIN)],
    [(-2, -1, THIN), (-1, -1, THIN), (0, 0, THIN), (1, 0, THIN)],
    [(-1, -1, THIN), (0, -1, THIN)],
)


# a particle lives only while every pixel of it, `reach` either side of its centre, stays clear of
# the frame's edge, and while it keeps within `leash` of the hero, so a jump leaves nothing hanging
def lifespan(particle, life, frames, reach, leash):
    height, width = frames[0].height, frames[0].rows[0].shape[1]
    margin = 1 + reach
    for age in range(life):
        x, y = position(particle, age)
        if not (margin <= x <= width - 1 - margin and margin <= y <= height - 1 - margin):
            return age
        apart = frame_at(frames, particle.birth + age).extra['apart']
        if apart[int(round(y)), int(round(x))] > leash:
            return age
    return life


def frame_at(frames, index):
    if frames[0].loops:
        return frames[index % len(frames)]
    return frames[min(max(index, 0), len(frames) - 1)]


def mote_looks(rng, life):
    fade = [[(0, 0, MOTE_FADE[i * len(MOTE_FADE) // life])] for i in range(life)]
    # a mote twinkles once it has drifted clear of the cape, never on the rim it left
    if life > 3 and rng.random() < TWINKLE_CHANCE:
        fade[int(rng.integers(2, life - 1))] = TWINKLE
    return fade


# on a loop a particle must be gone before its birth frame comes round again, or it would jump
# back to where it started
def longest_life(frames, life):
    return min(life[1], frames[0].count + 1) if frames[0].loops else life[1]


# a mote shed near the ground has no room to sink, so it rides the cold air up off the floor
def fall(rng, y):
    sink = rng.uniform(0.1, 0.45)
    return sink if y < LOW_MOTE else sink - 0.5


# motes shed together off a straight stretch of the cape would drift alike and keep its line, a dotted
# streak along where its edge was: each starts a pixel or so off it and sinks or rises at its own pace
def scatter(x, y, birth):
    spread = 2 * hashed(x, y, birth) - 1
    return round(spread * SHED_JITTER), spread * DRIFT_SPREAD


def mote_maker(frames, most):
    def make(rng, x, y, birth):
        offset, drift = scatter(x, y, birth)
        mote = Particle(birth=birth, life=0, x=x - rng.uniform(1, 3), y=y + offset,
                        vx=-rng.uniform(0.5, 1.2), vy=fall(rng, y) + drift, sway=rng.uniform(0.0, 0.6),
                        period=rng.uniform(4, 8), phase=rng.uniform(0, 6.3), looks=[], behind=True)
        life = int(rng.integers(min(MOTE_LIFE[0], most - 1), most))
        mote.life = lifespan(mote, life, frames, 1, MOTE_LEASH)
        mote.looks = mote_looks(rng, max(1, mote.life))
        return mote
    return make


def wisp_maker(frames, most):
    def make(rng, x, y, birth):
        wisp = Particle(birth=birth, life=0, x=x + rng.uniform(-1, 1), y=y - rng.uniform(0, 1.5),
                        vx=-rng.uniform(0.3, 0.8), vy=-rng.uniform(0.0, 0.25),
                        looks=list(WISP_LOOKS), behind=True)
        life = int(rng.integers(min(WISP_LIFE[0], most - 1), most))
        wisp.life = lifespan(wisp, life, frames, 2, WISP_LEASH)
        return wisp
    return make


def mote_points(frame):
    cape = frame.extra['cape']
    return points_of(cape['back'] | cape['hem'])


def mist_points(frame):
    hem = frame.extra['cape']['hem']
    ys = np.nonzero(frame.body | hem)[0]
    if len(ys) == 0:
        return []
    bottom = ys.max()
    feet = rows_between(outer_ring(frame.body), bottom - FEET_DEPTH, bottom)
    return points_of(feet | rows_between(hem, bottom - MIST_DEPTH, bottom))


def dress_air(frames):
    for frame in frames:
        frame.extra['apart'] = nd.distance_transform_edt(frame.extra['cape']['empty'])
    strip = frames[0].strip
    mote_most, wisp_most = longest_life(frames, MOTE_LIFE), longest_life(frames, WISP_LIFE)
    motes = spaced(frames, spawn(frames, generator('blue', strip, 'motes'), mote_points,
                                 mote_maker(frames, mote_most), MOTES_A_FRAME, mote_most))
    wisps = spawn(frames, generator('blue', strip, 'mist'), mist_points,
                  wisp_maker(frames, wisp_most), WISPS_A_FRAME, wisp_most)
    before = [[row.copy() for row in frame.rows] for frame in frames]
    draw(frames, motes)
    draw(frames, wisps)
    for frame, rows in zip(frames, before):
        guard = frame.extra['cape']['guard']
        for row, was in zip(frame.rows, rows):
            row[guard] = was[guard]
