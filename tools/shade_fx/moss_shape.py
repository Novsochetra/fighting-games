"""Where on a frame the moss Shade's moss can take hold: his own outline, his head (kept bare), how
deep each pixel lies from an edge, and a moss pattern that travels with his hood."""
from dataclasses import dataclass
import numpy as np
from scipy import ndimage as nd
from .moss_head import head_of
from .moss_hood import crown_of
from .paint import box, shifted
from .particles import generator

# where his feet stand in every frame
FEET_Y = 76
# he is no taller than this lying on the ground
LYING = 30
LATTICE = generator('moss', 'lattice').random((64, 64))


@dataclass
class Shape:
    hero: np.ndarray
    top: int
    bottom: int
    left: int
    right: int
    # the crown of his hood; every pattern is laid from here, so it moves with him
    anchor: tuple
    # his hood and face, and the pixels round and over them that no effect may touch
    head: np.ndarray
    guard: np.ndarray
    # which way his body runs from his head, a unit (x, y)
    down: np.ndarray

    @property
    def tall(self):
        return self.bottom - self.top + 1

    @property
    def lying(self):
        return self.tall <= LYING

    # his waist: above it his cloak hangs off his shoulders, below it the cloak trails
    @property
    def waist(self):
        return self.top + self.tall // 2


# the ultimate's body is cut from its own single row, blade and all: his chunky parts are him, the
# thin blade sticking out of them is not
def hero_of(frame):
    if frame.strip != 'ult':
        return frame.body
    core = nd.binary_opening(frame.body, structure=np.ones((5, 5), bool))
    return frame.body & nd.binary_dilation(core, iterations=2) & ~frame.smear


def shape_of(frame, before=None):
    hero = hero_of(frame)
    top, bottom, left, right = box(hero)
    anchor = crown_of(hero, top, before.anchor if before else None)
    head, guard, down = head_of(hero, anchor)
    return Shape(hero, top, bottom, left, right, anchor, head, guard, down)


def shapes_of(frames):
    shapes = []
    for frame in frames:
        shapes.append(shape_of(frame, shapes[-1] if shapes else None))
    return shapes


# how many pixels of the mask lie beyond each of its pixels toward (dx, dy), up to `most`;
# -1 outside the mask
def depth_toward(mask, dx, dy, most=6):
    depth = np.zeros(mask.shape, int)
    still = mask.copy()
    for step in range(1, most + 1):
        still &= shifted(mask, -dx * step, -dy * step)
        depth += still
    return np.where(mask, depth, -1)


def lattice(x, y, salt):
    return LATTICE[(y + 17 * salt) % 64, (x + 31 * salt) % 64]


def smooth(fraction):
    return fraction * fraction * (3 - 2 * fraction)


# smooth value noise from 0 to 1 laid from the anchor, in cells `cell` pixels wide
def pattern(shape, size, cell, salt):
    ys, xs = np.mgrid[0:size[0], 0:size[1]]
    across = (xs - shape.anchor[0]) / cell
    down = (ys - shape.anchor[1]) / cell
    column, row = np.floor(across).astype(int), np.floor(down).astype(int)
    blend_x, blend_y = smooth(across - column), smooth(down - row)
    upper = mix(lattice(column, row, salt), lattice(column + 1, row, salt), blend_x)
    lower = mix(lattice(column, row + 1, salt), lattice(column + 1, row + 1, salt), blend_x)
    return mix(upper, lower, blend_y)


def mix(start, end, share):
    return start * (1 - share) + end * share
