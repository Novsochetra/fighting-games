"""Sweeping a weapon row clean before the Firefly Shade is dressed.

Where the weapon bake takes his blade away it can leave a few dark pixels of its hilt or outline
floating loose beside him; out in the air they read as specks of dirt, so they go.
"""
import numpy as np
from scipy import ndimage as nd
from .paint import EIGHT, luma, opaque

LOOSE_MOST = 14
DARK = 0.3


def loose_dark_bits(row):
    pieces, count = nd.label(opaque(row), structure=EIGHT)
    sizes = np.bincount(pieces.ravel(), minlength=count + 1)
    light = np.bincount(pieces.ravel(), weights=luma(row).ravel(), minlength=count + 1)
    loose = (sizes <= LOOSE_MOST) & (light < DARK * sizes)
    loose[0] = False
    return loose[pieces]


# the sword row is the art as drawn, so a loose bit drawn there stays in every row
def sweep_loose_bits(frames):
    for frame in frames:
        drawn = loose_dark_bits(frame.sword)
        for row in frame.rows[1:]:
            row[loose_dark_bits(row) & ~drawn] = 0
