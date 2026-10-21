"""The paths the Firefly Shade's swarm flies: rings and figure eights round him.

A few fireflies share each orbit, evenly spaced, and turn round it one spacing a loop. A firefly's
brightness follows where it is on its orbit, pulsing as it goes round and dimmer on the far side.
"""
from dataclasses import dataclass
import math
from .firefly_clock import beat_of

GROUND = 73


# `flies` share the orbit evenly spaced; `turn` is its direction; `pulses` how often a firefly
# brightens per turn; `eight` flies a figure eight instead of an ellipse
@dataclass(frozen=True)
class Orbit:
    flies: int
    offset: tuple
    radii: tuple
    tilt: float
    turn: int
    pulses: int
    phase: float
    behind: bool = False
    eight: bool = False


# round the centre of his body, which his blade and the cloak's flare pull low and forward: a wide
# ring at the waist that passes in front of him, a ring behind his shoulders, and a few that hover
# in the open air behind his back and over his hood
ORBITS = (
    Orbit(flies=3, offset=(-6, 4), radii=(26, 6), tilt=12, turn=1, pulses=2, phase=0.0),
    Orbit(flies=2, offset=(-14, -12), radii=(13, 4), tilt=30, turn=-1, pulses=1, phase=2.1,
          behind=True),
    Orbit(flies=1, offset=(-21, -20), radii=(3, 2), tilt=0, turn=-1, pulses=1, phase=3.6,
          behind=True, eight=True),
    Orbit(flies=1, offset=(-30, 9), radii=(2, 3), tilt=0, turn=1, pulses=1, phase=0.9,
          behind=True, eight=True),
    Orbit(flies=1, offset=(-34, -8), radii=(3, 2), tilt=0, turn=1, pulses=1, phase=4.8,
          behind=True, eight=True),
    Orbit(flies=1, offset=(-9, -32), radii=(3, 2), tilt=0, turn=-1, pulses=1, phase=2.4,
          behind=True, eight=True),
)

# on his ultimate the swarm thickens: a second ring at his chest turning against the first
SURGE = (Orbit(flies=3, offset=(2, -6), radii=(21, 5), tilt=-8, turn=-1, pulses=2, phase=1.0),)


def angle_step(orbit, frame):
    return orbit.turn * 2 * math.pi / (orbit.flies * beat_of(frame).length)


def angle_of(orbit, slot, frame):
    spacing = 2 * math.pi * slot / orbit.flies
    return orbit.phase + spacing + angle_step(orbit, frame) * beat_of(frame).at


# `anchor` is the swarm's centre and how far it spreads: 1 round his body, less drawn in tight. Drawn
# in round his raised blade, the orbits' offsets from his body shrink faster than the orbits, so the
# swarm closes on the blade instead of hanging back over his hood
def spot_on(orbit, angle, anchor):
    centre_x, centre_y, spread = anchor
    across = spread * orbit.radii[0] * math.cos(angle)
    down = spread * orbit.radii[1] * (math.sin(2 * angle) if orbit.eight else math.sin(angle))
    tilt = math.radians(orbit.tilt)
    reach = spread * spread
    x = centre_x + reach * orbit.offset[0] + across * math.cos(tilt) - down * math.sin(tilt)
    y = centre_y + reach * orbit.offset[1] + across * math.sin(tilt) + down * math.cos(tilt)
    return x, min(y, GROUND)


def level_at(orbit, angle):
    depth = 0.0 if orbit.eight else math.sin(angle)
    pulse = math.cos(orbit.pulses * angle + orbit.phase)
    return int(round(1.8 + 1.3 * pulse + 0.3 * depth))
