"""The Blue Shade's black cape: a cold rim light on its back and top, folds hanging from its back
edge (blue_folds.py) and frost on its hem (blue_rime.py)."""
import numpy as np
from scipy import ndimage as nd
from .frames import without_specks
from .paint import CROSS, EIGHT, shifted
from .blue_folds import dress_folds
from .blue_hood import hood_parts
from .blue_palette import DEEP, ICE, PALE
from .blue_rime import dress_rime, limbs_of, over_limbs

DARKEST_CLOTH = 16
SMALLEST_CLOTH = 30
HOOD_TO_CAPE = 16
CLOTH_DEPTH = 3
CLOTH_CORE = 40
SHORTEST_HEM = 3
HEM_DROP = 4
# a stride's feet lie this far either side of the gap between his legs; a foot lifted further than
# this off the ground leaves no gap under him, and cloth hanging lower than that is checked this
# far below it
LEG_REACH = 40
FEET_CLEAR = 6
LOW_CLOTH = 3


def black_of(img):
    return (img[..., 3] > 0) & (img[..., :3].max(-1) < DARKEST_CLOTH)


# the cape and hood are one flat black shape; the armour's own black outlines are a pixel thin,
# so opening the black takes them away and leaves the cloth. The black legs open out as pieces of
# their own: the cape is the pieces that start near the top of the hood, and any piece broad
# enough to be cloth swinging free of it, where a leg is never more than a few pixels across
def cloth_of(img):
    cloth = nd.binary_opening(black_of(img), structure=CROSS)
    labels, count = nd.label(cloth, structure=EIGHT)
    sizes = np.bincount(labels.ravel())
    pieces = [(label, rows.start) for label, (rows, _) in enumerate(nd.find_objects(labels), 1)
              if sizes[label] >= SMALLEST_CLOTH]
    if not pieces:
        return np.zeros_like(cloth), cloth
    top = min(start for _, start in pieces)
    cape = np.isin(labels, [label for label, start in pieces
                            if start <= top + HOOD_TO_CAPE or broad(labels == label)])
    return cape, cloth & ~cape


def broad(piece):
    return nd.binary_erosion(piece, structure=CROSS, iterations=CLOTH_DEPTH).sum() >= CLOTH_CORE


def cape_parts(plain, frame):
    img = plain[1] if len(plain) > 1 else plain[0]
    cape, legs = cloth_of(img)
    edged = black_of(img) & nd.binary_dilation(cape, structure=EIGHT, iterations=2) & ~legs
    empty = img[..., 3] == 0
    # an edge pixel backed by armour instead of cloth is the armour's own outline
    unarmoured = black_of(img) | empty
    back = edged & shifted(empty, 1, 0) & shifted(unarmoured, -1, 0) & first_in_row(edged)
    back &= backed_by(cape, 1, 0)
    # the air shut in between his boots lies over no cloth's top
    open_air = empty & ~nd.binary_fill_holes(~empty)
    top = edged & shifted(open_air, 0, 1) & shifted(unarmoured, 0, -1) & ~back & backed_by(cape, 0, 1)
    bottom = edged & shifted(open_below(empty), 0, -1) & shifted(unarmoured, 0, 1)
    hem = without_specks(bottom, SHORTEST_HEM)
    head, guard = hood_parts(frame)
    return {'cape': cape, 'back': back & ~guard, 'top': top & ~guard, 'empty': empty, 'head': head,
            'guard': guard, 'hem': hem & ~guard & ~between_legs(hem, frame.body)}


# a black edge of his body lying just past the cape (a boot or a fist under its hem, a leg across it)
# is no edge of the cloth: an edge is the cape's own only with its cloth a pixel or two in from it
def backed_by(cape, dx, dy):
    return cape | shifted(cape, -dx, -dy) | shifted(cape, -2 * dx, -2 * dy)


# cloth hanging between his legs has a leg either side of the air under it all the way down to his
# feet, where under the cape's own hem the air opens out behind him
def between_legs(hem, body):
    bottom = np.nonzero(body.any(1))[0].max() - FEET_CLEAR
    out = np.zeros_like(hem)
    for y, x in zip(*np.nonzero(hem)):
        below = body[y + 1:max(bottom, y + LOW_CLOTH) + 1]
        left = below[:, max(0, x - LEG_REACH):x].any(1)
        right = below[:, x + 1:x + 1 + LEG_REACH].any(1)
        out[y, x] = len(below) > 0 and left.all() and right.all()
    return out


# the hem is the cape's lower edge with open air under it, where under the hood's brim lies the
# face and close under the cape's inner fold the legs
def open_below(empty):
    open_air = empty.copy()
    for depth in range(1, HEM_DROP):
        open_air &= shifted(empty, 0, -depth)
    return open_air


# the cape hangs behind everything else; a leg's black edge further in faces only the gap between
# the legs and the cape, which no light reaches
def first_in_row(mask):
    first = np.zeros_like(mask)
    ys = np.flatnonzero(mask.any(1))
    first[ys, mask[ys].argmax(1)] = True
    return first


def cloth_painter(guard):
    def paint_cloth(frame, mask, color):
        for row in frame.rows:
            row[mask & ~guard & black_of(row)] = color
    return paint_cloth


# where the cape lies across his own limbs its back edge faces down onto him, out of the light
def dress_cape(frame, plain):
    parts = cape_parts(plain, frame)
    paint_cloth = cloth_painter(parts['guard'])
    back = parts['back'] & ~over_limbs(limbs_of(parts, frame.body))
    rim = back | parts['top']
    inside = (shifted(back, 1, 0) | shifted(rim, 0, 1)) & parts['cape'] & ~rim
    dress_rime(frame, parts, paint_cloth)
    paint_cloth(frame, parts['top'], PALE)
    paint_cloth(frame, back, ICE)
    paint_cloth(frame, inside, DEEP)
    dress_folds(frame, parts, paint_cloth)
    frame.extra['cape'] = parts
