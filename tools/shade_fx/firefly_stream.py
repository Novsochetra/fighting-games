"""On a swing, fireflies stream off along the slash and hang in the air behind it as it fades.

They rise a little way out from the smear, never on it, and drift on outward from the Shade, so the
cut stays clean while the swarm pours after the blade. None flies so near another, on any frame of
its flight, that the two run together.
"""
import math
import numpy as np
from scipy import ndimage as nd
from . import particles
from .firefly_flock import draw_flock
from .firefly_light import firefly_look, straight_path
from .paint import CROSS, EIGHT, opaque

SWINGS = ('slash1', 'slash2', 'spin_slash', 'thrust', 'rising_dragon', 'cleave', 'air_slash',
          'air_rising_cut', 'meteor_slash', 'plunge', 'ult')
PER_SWING = 3
SWING_LEAST = 20
FACE_CLEAR = 12
SPACING = 6
LIFE = (3, 5)


# what a weapon row takes away from the sword row: the blade, wherever the bake erased it
def erased(frame):
    gone = np.zeros_like(frame.body)
    for row in frame.rows[1:]:
        gone |= opaque(frame.sword) & ~opaque(row)
    return gone


# the swing's own arc, not the few loose sparks the art scatters round him, nor a blade held still
# before the swing, whose glow passes for smear and bunched the stream round his hand, nor a blade
# the weapon rows take away, round which the stream hung in empty air there
def swing_of(frame):
    smear = frame.smear & ~frame.extra['firefly'].blade & ~erased(frame)
    labels, count = nd.label(smear, structure=EIGHT)
    if count == 0:
        return smear
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    return (sizes >= SWING_LEAST)[labels]


def beside_smear(frame):
    swing = swing_of(frame)
    if not swing.any():
        return []
    near = nd.binary_dilation(swing, structure=CROSS, iterations=3)
    closer = nd.binary_dilation(swing, structure=CROSS, iterations=2)
    empty = ~nd.binary_dilation(opaque(frame.sword), structure=CROSS)
    face = nd.binary_dilation(frame.extra['firefly'].eyes, structure=EIGHT, iterations=FACE_CLEAR)
    return particles.points_of(near & ~closer & empty & ~face)


def make_streamer(rng, spot, birth, centre):
    x, y = spot
    away = np.array([x - centre[0], y - centre[1]], float)
    away /= max(1.0, float(np.hypot(*away)))
    speed = float(rng.uniform(0.6, 1.2))
    vx, vy = away[0] * speed, away[1] * speed - 0.4
    looks = [firefly_look(level, straight_path((vx, vy))) for level in (3, 2, 1, 1, 0)]
    return particles.Particle(
        birth=birth, life=int(rng.integers(*LIFE)), x=x, y=y, vx=vx, vy=vy, looks=looks,
        sway=float(rng.uniform(0.3, 0.8)), period=4.0,
        phase=float(rng.uniform(0, 2 * math.pi)), behind=True)


# where it is on each frame of its flight, by frame index
def flight_of(streamer):
    return {streamer.birth + age: particles.position(streamer, age) for age in range(streamer.life)}


def clear_of(flight, flock):
    for other in flock:
        for index, there in flight_of(other).items():
            here = flight.get(index)
            if here is not None and abs(here[0] - there[0]) + abs(here[1] - there[1]) < SPACING:
                return False
    return True


# a few round the arc, each kept clear of every other all the way along its flight
def born_on(frame, rng, flock):
    centre = frame.extra['firefly'].centre
    points = beside_smear(frame)
    born = []
    for i in rng.permutation(len(points)):
        streamer = make_streamer(rng, points[i], frame.index, centre)
        if clear_of(flight_of(streamer), flock + born):
            born.append(streamer)
        if len(born) == PER_SWING:
            break
    return born


# born only on the swing's own frames, so a strip never opens with a stream already in the air
def stream_behind_swing(frames):
    if frames[0].strip not in SWINGS:
        return
    rng = particles.generator('firefly', frames[0].strip, 'stream')
    flock = []
    for frame in frames:
        flock += born_on(frame, rng, flock)
    draw_flock(frames, flock)
