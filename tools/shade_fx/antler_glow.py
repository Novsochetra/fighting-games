"""The Antler Spirit Shade's runes, eyes and blade burning brighter, each with a soft halo.

Runes and eyes take a step up the ghost fire's ramp and pulse once round a loop; the dark armour
right beside them takes a breath of their teal. The blade and its smear, only in the sword row,
where the hero holds them, and the burning cloak edge glow out onto the empty pixels round them.
"""
import math
import numpy as np
from scipy import ndimage as nd
from .paint import CROSS, EIGHT, luma, opaque, outer_ring
from .antler_palette import ABYSS, GLOW, MID, MIST, PALE, TEAL, WHITE

RUNE = [MID, TEAL, GLOW, PALE, WHITE]
RUNE_CUTS = np.array([0.36, 0.5, 0.8, 0.9])
PULSE = 0.05
SPILL_DARKEST = 0.1
UNDERGROUND = 3
RUNE_MOST = 22


def pulse_of(frame):
    turn = frame.index / frame.count if frame.loops else frame.index / 6
    return math.cos(2 * math.pi * turn)


# the hero's own runes and eyes are small; a bigger glow inside his outline is a blade the bake
# left in place, or the ultimate's, already as bright as it gets
def runes_of(frame):
    return without_large(frame.glow & frame.body, RUNE_MOST)


def without_large(mask, most):
    labels, count = nd.label(mask, structure=EIGHT)
    if count == 0:
        return mask
    sizes = np.bincount(labels.ravel())
    sizes[0] = most + 1
    return (sizes <= most)[labels]


def brighten(frame, runes):
    light = luma(frame.sword)
    step = np.searchsorted(RUNE_CUTS - PULSE * pulse_of(frame), light)
    for row, bare in zip(frame.rows, frame.extra['bare']):
        for level, color in enumerate(RUNE):
            row[runes & bare & (step == level)] = color


# black armour lines right beside a rune take its glow; the outline round his figure stays black
def spill(frame, runes):
    near = nd.binary_dilation(runes, CROSS) & ~runes & frame.body
    rim = nd.binary_dilation(~opaque(frame.sword), CROSS)
    dark = luma(frame.sword) < SPILL_DARKEST
    for row, bare in zip(frame.rows, frame.extra['bare']):
        row[near & dark & ~rim & bare] = ABYSS


# no glow below the ground he stands on
def halo_behind(row, mask, color):
    ring = outer_ring(mask) & ~opaque(row)
    ring[row.shape[0] - UNDERGROUND:] = False
    row[ring] = color


# the sword row holds the blade the glow mask was taken from; every other row glows only where it
# shows the hero's own runes
def glow_out(frame):
    runes = runes_of(frame)
    for weapon, (row, bare) in enumerate(zip(frame.rows, frame.extra['bare'])):
        lit = (frame.glow | frame.smear) & opaque(row) if weapon == 0 else runes & bare
        halo_behind(row, lit, MIST)
        halo_behind(row, frame.extra['burning'], MIST)


def glow_runes(frame):
    runes = runes_of(frame)
    spill(frame, runes)
    brighten(frame, runes)
