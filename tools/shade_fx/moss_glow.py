"""The moss Shade's blade breathing a little green: a faint one-pixel haze beside it. His trim, eyes
and blade glow as drawn; the haze is all that is added, and never beside his head."""
import numpy as np
from scipy import ndimage as nd
from .moss_palette import HAZE
from .paint import outer_ring

MIN_BLADE, MIN_LENGTH, BLADE_SWAY = 8, 7, 1.9
# a frame mid-swing, its smear this big, keeps its blade as it is: the smear's pieces run thin too
SWING = 20
EIGHT = np.ones((3, 3), bool)


# the blade is what the sword row draws and the fists row leaves empty (the fists row keeps its
# smear, recoloured; the ultimate has no fists row, so there it is the glow off his body): the
# biggest piece of it running thin and straight out of his hand
def blade_of(frame, shape, plain):
    if len(frame.rows) > 1:
        drawn = (plain[..., 3] > 0) & (frame.rows[1][..., 3] == 0)
    else:
        drawn = ~shape.hero
    labels, count = nd.label(drawn & (frame.glow | frame.smear), structure=EIGHT)
    hand = nd.binary_dilation(shape.hero, structure=EIGHT, iterations=4)
    pieces = [labels == number for number in range(1, count + 1)]
    held = [piece for piece in pieces if (piece & hand).any() and straight(piece)]
    blade = max(held, key=np.sum) if held else np.zeros_like(drawn)
    return blade if (frame.smear & ~blade).sum() < SWING else np.zeros_like(drawn)


def straight(piece):
    ys, xs = np.nonzero(piece)
    if len(xs) < MIN_BLADE:
        return False
    points = np.vstack([xs, ys]).astype(float)
    points -= points.mean(axis=1, keepdims=True)
    across, along = np.linalg.eigh(np.cov(points))[1].T
    reach = along @ points
    return np.abs(across @ points).max() <= BLADE_SWAY and reach.max() - reach.min() >= MIN_LENGTH


# only the sword row holds the blade; the other weapons are steel and wood and do not glow
def glow_blade(frame, shape, blade):
    if not blade.any():
        return
    sword = frame.sword
    room = (sword[..., 3] == 0) & inside_margin(blade.shape) & ~shape.guard
    sword[outer_ring(blade) & room] = HAZE


def inside_margin(size):
    room = np.zeros(size, bool)
    room[1:-1, 1:-1] = True
    return room


def bloom(frame, shape, blade):
    glow_blade(frame, shape, blade)
