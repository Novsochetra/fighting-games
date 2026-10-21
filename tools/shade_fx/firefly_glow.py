"""The Firefly Shade's cyan: eyes burning brighter in the hood's shadow, a bloom round his blade."""
import numpy as np
from scipy import ndimage as nd
from .firefly_light import inside
from .firefly_palette import BLADE_BLOOM, EYE, EYE_CORE, EYE_SPILL
from .paint import EIGHT, luma, opaque, outer_ring

FACE_SHADOW = 0.06


def light_eyes(frames):
    for frame in frames:
        eyes = frame.extra['firefly'].eyes
        if not eyes.any():
            continue
        sword = frame.sword
        brightest = eyes & (luma(sword) >= luma(sword)[eyes].max() - 0.02)
        spill = outer_ring(eyes) & opaque(sword) & (luma(sword) < FACE_SHADOW)
        shown = [np.all(row == sword, axis=-1) for row in frame.rows]
        for row, same in zip(frame.rows, shown):
            row[spill & same] = EYE_SPILL
            row[eyes & same] = EYE
            row[brightest & same] = EYE_CORE


# the pieces of the blade's glow a row still shows whole: where the weapon bake took the blade away
# or recoloured part of a piece, what is left of it is no blade to bloom round
def whole_pieces(blade, row, sword):
    pieces, count = nd.label(blade, structure=EIGHT)
    changed = np.bincount(pieces[np.any(row != sword, axis=-1)], minlength=count + 1)
    whole = changed == 0
    whole[0] = False
    return whole[pieces]


def bloom_blade(frames):
    for frame in frames:
        blade = frame.extra['firefly'].blade
        for row in frame.rows:
            bloom = outer_ring(whole_pieces(blade, row, frame.sword)) & ~opaque(row)
            for y, x in zip(*np.nonzero(bloom)):
                if inside(frame, x, y):
                    row[y, x] = BLADE_BLOOM
