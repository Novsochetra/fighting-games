"""How hot the Antler Spirit Shade's ghost fire burns at each pixel of a frame.

The cloak burns most at its hem and wherever it streams out far behind him, never round the hood.
The fire boils: two smooth noise fields, stretched tall so they read as flame tongues, blend round
a circle once every six frames, and once round the loop on a looping strip, so its last frame runs
into its first.
"""
import math
import numpy as np
from scipy import ndimage as nd
from .frames import FW
from .paint import box, hashed
from .particles import generator

CELL = (3, 6)
BOIL = 0.4
CLEAR = 4
HOTTEST = 0.95


def noise_field(rng, height):
    across, down = CELL
    lattice = rng.uniform(-1, 1, (height // down + 2, FW // across + 2))
    ys, xs = np.mgrid[0:height, 0:FW]
    fy, fx = ys / down, xs / across
    y0, x0 = fy.astype(int), fx.astype(int)
    ty, tx = smooth(fy - y0), smooth(fx - x0)
    top = lattice[y0, x0] * (1 - tx) + lattice[y0, x0 + 1] * tx
    bottom = lattice[y0 + 1, x0] * (1 - tx) + lattice[y0 + 1, x0 + 1] * tx
    return top * (1 - ty) + bottom * ty


def smooth(share):
    return share * share * (3 - 2 * share)


def boil_fields(frames):
    rng = generator('antler', frames[0].strip, 'boil')
    height = frames[0].height
    return noise_field(rng, height), noise_field(rng, height)


def turn_of(frame):
    turn = frame.index / frame.count if frame.loops else frame.index / 6
    return 2 * math.pi * turn


# the hem burns most at his back and least in front of his legs; cloak streaming out far behind
# him burns too, more the lower it hangs
def base_heat(frame):
    top, bottom, _, _ = box(frame.body)
    ys, xs = np.mgrid[0:frame.height, 0:FW]
    down = (ys - top) / max(1, bottom - top)
    core = np.median(np.nonzero(frame.body)[1])
    low = np.clip((down - 0.32) / 0.5, 0, 1)
    back = np.clip((core + 4 - xs) / 10, 0, 1)
    far = np.clip((core - xs - 8) / 16, 0, 1)
    return np.clip(low * (0.3 + 0.7 * back) + 0.85 * far * (0.45 + 0.55 * down), 0, HOTTEST)


# the fire cools off round the blade, its smear and the runes, so a blade swung across the
# burning cloak keeps its own dark edge and never sinks into the flames
def clearance(frame):
    away = nd.distance_transform_edt(~(frame.glow | frame.smear))
    return np.clip((away - 1) / CLEAR, 0, 1)


def heat_of(frame, fields):
    first, second = fields
    angle = turn_of(frame)
    boil = first * math.cos(angle) + second * math.sin(angle)
    base = base_heat(frame)
    return np.where(base > 0, base + BOIL * boil, 0) * clearance(frame)


# a speck of flicker per pixel, new every frame, so a burning edge breaks up instead of running
# as one stroke
def flicker(frame):
    ys, xs = np.mgrid[0:frame.height, 0:FW]
    return hashed(xs, ys, frame.index + 1) - 0.5
