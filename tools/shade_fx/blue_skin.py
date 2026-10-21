"""Where a frame draws the Blue Shade's face as bare tan skin under his hood, as his thrust does,
it is drawn as the mask of his design: black, lit down its front and along its chin, with its one
eye. Under the chin, where the skin draws back to his neck, it goes black with the hood."""
import numpy as np
from scipy import ndimage as nd
from .paint import EIGHT, hsv
from .blue_palette import MASK_EDGE, PALE

# the lightest skin, warm and pale, is surely his face; the greyer shading round it is grown from it
TAN_WARMTH, TAN_LIGHT = 20, 0.42
GREYEST, DARKEST_SKIN, LIGHTEST_SKIN, BLUEST_SKIN = 0.4, 0.2, 0.7, 40
SMALLEST_FACE = 4
# where the front of the skin draws back this far from one row to the next, the chin is above it
NECK_STEP = 2
EYE_UP, EYE_BACK = 2, 2
# the eye is set in the face or the hood's black beside it, never on his armour
DARKEST_EYE = 16


def skin_of(sword, head):
    rgb = sword[..., :3].astype(int)
    _, sat, val = hsv(sword)
    solid = sword[..., 3] > 0
    greyish = solid & (sat < GREYEST) & (val > DARKEST_SKIN) & (val < LIGHTEST_SKIN)
    skin = greyish & (rgb[..., 0] >= rgb[..., 2] - BLUEST_SKIN)
    tan = skin & (rgb[..., 0] - rgb[..., 2] >= TAN_WARMTH) & (val >= TAN_LIGHT) & head
    labels, _ = nd.label(skin & nd.binary_dilation(head, structure=EIGHT), structure=EIGHT)
    face = np.isin(labels, np.unique(labels[tan & (labels > 0)]))
    return face if face.sum() >= SMALLEST_FACE else None


# the front of the face on each of its rows, a row the skin skips taking the one above it
def fronts_of(face):
    rows = np.flatnonzero(face.any(1))
    fronts, last = {}, None
    for y in range(rows.min(), rows.max() + 1):
        xs = np.flatnonzero(face[y])
        last = xs.max() if len(xs) else last
        fronts[y] = last
    return fronts


def chin_row(fronts):
    rows = sorted(fronts)
    for y in rows[1:]:
        if fronts[y - 1] - fronts[y] >= NECK_STEP:
            return y - 1
    return rows[-1]


def mask_of(face):
    fronts = fronts_of(face)
    chin = chin_row(fronts)
    lit = np.zeros_like(face)
    for y, x in fronts.items():
        if y <= chin:
            lit[y, x] = True
    lit[chin] |= face[chin]
    eye_y = max(min(fronts), chin - EYE_UP)
    return lit, (fronts[eye_y] - EYE_BACK, eye_y)


def dress_skin(frame, sword, hood_black):
    face = skin_of(sword, frame.extra['cape']['head'])
    if face is None:
        return False
    lit, (eye_x, eye_y) = mask_of(face)
    painted = sword.copy()
    painted[face] = hood_black
    painted[lit] = MASK_EDGE
    changed = face | lit
    if face[eye_y, eye_x] or sword[eye_y, eye_x, :3].max() < DARKEST_EYE:
        painted[eye_y, eye_x] = PALE
        changed[eye_y, eye_x] = True
    for row in frame.rows:
        same = changed & (row == sword).all(-1)
        row[same] = painted[same]
    return True
