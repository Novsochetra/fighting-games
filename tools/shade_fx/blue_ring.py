"""The Blue Shade's face where a frame draws it as a lit ring shut round a dim inside, lower than
his hood's band reaches (blue_head.py), as his rising cut does: the ring opens into the mask of
his design (blue_mask.py), lit only down its front and along its chin, black behind, with its eye."""
import numpy as np
from scipy import ndimage as nd
from .paint import CROSS, EIGHT, box
from .blue_line import masks_of
from .blue_mask import eye_added
from .blue_palette import PALE

# the inside is a few pixels of dim face, never the hood's black, with no more than this many of
# the pixels beside it unlit, where a dim pixel of the ring lets it through
SMALLEST_INSIDE, LARGEST_INSIDE = 4, 12
MOST_GAPS = 1
# an armour ring lies further back or lower: the face's front is at the hood's, its top just under
FRONT_REACH, BELOW_HOOD = 1, 4


def ring_round(inside, lit):
    beside = nd.binary_dilation(inside, structure=CROSS) & ~inside
    return (beside & ~lit).sum() <= MOST_GAPS


def at_hood_front(face, head):
    hood = box(head)
    if hood is None:
        return False
    top, _, _, front = box(face)
    return front >= hood[3] - FRONT_REACH and hood[0] <= top <= hood[1] + BELOW_HOOD


def ring_face(sword, glow, head):
    masks = masks_of(sword, glow)
    dim = ~masks['air'] & ~masks['lit'] & ~masks['dark']
    labels, count = nd.label(dim, structure=CROSS)
    for label in range(1, count + 1):
        inside = labels == label
        sized = SMALLEST_INSIDE <= inside.sum() <= LARGEST_INSIDE
        if not sized or not ring_round(inside, masks['lit']):
            continue
        face = inside | (nd.binary_dilation(inside, structure=EIGHT) & masks['lit'])
        if at_hood_front(face, head):
            return face
    return None


# the front pixel of each row and the chin's bottom row stay lit; the ring's back goes dark
def front_and_chin(face):
    lit = np.zeros_like(face)
    rows = np.flatnonzero(face.any(1))
    for y in rows:
        lit[y, np.flatnonzero(face[y]).max()] = True
    lit[rows.max(), np.flatnonzero(face[rows.max()])[1:]] = True
    return lit


def dress_ring(frame, sword, hood_black):
    face = ring_face(sword, frame.glow, frame.extra['cape']['head'])
    if face is None:
        return False
    lit = front_and_chin(face)
    eye = eye_added(lit, face & ~lit)
    for row in frame.rows:
        same = (row == sword).all(-1)
        row[face & ~lit & same] = hood_black
        row[eye & same] = PALE
    return True
