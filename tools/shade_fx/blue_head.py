"""The Blue Shade's face under his hood. Where a frame drew his mask as a flat blue plate it is drawn
as his design has it (blue_mask.py): the face black in the hood, lit only along its edge, with its
eye. A face drawn as bare skin gets the same mask (blue_skin.py), and one drawn as no more than the
lit line down its front gets the chin and eye (blue_profile.py)."""
import numpy as np
from scipy import ndimage as nd
from .paint import EIGHT
from .blue_mask import bridge_colours, eye_added, eye_painted, face_lines
from .blue_palette import PALE
from .blue_profile import dress_profile
from .blue_skin import dress_skin

HOOD_DEPTH = 14
HOOD_BACK = 10
ABOVE_HOOD = 2
HOOD_BLACK = np.array([0, 0, 0, 255], np.uint8)
# a mask narrower than this, or with less inside it than this, is already drawn as a line
WIDEST_LINE = 3
SMALLEST_FILL = 6
EYE_WHITE = 150
# the face lies wrapped in the hood's black: open air and white round no more of it than this
FACE_AIR = 0.25
FACE_WHITE = 0.15


def hood_band(cape):
    band = np.zeros_like(cape)
    ys = np.nonzero(cape)[0]
    if len(ys) > 0:
        band[max(0, ys.min() - ABOVE_HOOD):ys.min() + HOOD_DEPTH] = True
    return band


# the face is the glow that starts highest under the hood; where none shows (his back turned, a
# fall) the head is the front of the hood
def face_front(glow, band, cape):
    labels, count = nd.label(glow & band, structure=EIGHT)
    if count:
        tops = [rows.start for rows, _ in nd.find_objects(labels)]
        return np.nonzero(labels == int(np.argmin(tops)) + 1)[1].min()
    xs = np.nonzero(cape & band)[1]
    return xs.max() - HOOD_BACK if len(xs) else None


# where the face is sought: from a little above the hood down past the chin, and from just behind
# the face to the front
def face_zone(glow, cape):
    band = hood_band(cape)
    front = face_front(glow, band, cape)
    head = np.zeros_like(cape)
    if front is not None:
        head[:, max(0, front - HOOD_BACK):] = True
    return head & band


# a blade, a swing's flash or its arc can reach into the hood too, but each meets open air or a
# white core
def wrapped(piece, sword):
    ring = nd.binary_dilation(piece, structure=EIGHT) & ~piece
    air = (ring & (sword[..., 3] == 0)).sum() / ring.sum()
    white = (ring & (sword[..., :3].min(-1) >= EYE_WHITE)).sum() / ring.sum()
    return air < FACE_AIR and white < FACE_WHITE


# the face is the biggest wrapped glow in the hood, with the smaller pieces its own dark lines split
# off it
def plate_of(glow, head, sword):
    white = sword[..., :3].min(-1) >= EYE_WHITE
    labels, count = nd.label(glow & head & ~white, structure=EIGHT)
    faces = [labels == label for label in range(1, count + 1) if wrapped(labels == label, sword)]
    if not faces:
        return None
    biggest = max(faces, key=lambda piece: piece.sum())
    ys, xs = np.nonzero(biggest)
    if xs.max() - xs.min() + 1 <= WIDEST_LINE:
        return None
    near = np.zeros_like(biggest)
    near[ys.min() - 1:ys.max() + 2, xs.min() - 1:xs.max() + 2] = True
    return np.any([piece for piece in faces if (piece & near).any()], axis=0)


def dress_face(frame, sword):
    if dress_skin(frame, sword, HOOD_BLACK):
        return
    plate = plate_of(frame.glow, face_zone(frame.glow, frame.extra['cape']['cape']), sword)
    drawn = None if plate is None else face_lines(plate, sword)
    if drawn is None or drawn[2].sum() < SMALLEST_FILL:
        dress_profile(frame, sword, HOOD_BLACK)
        return
    lines, added, inside = drawn
    eye, painted = eye_painted(sword, plate)
    if not eye.any():
        eye = eye_added(lines, inside)
        painted[eye] = PALE
    painted = bridge_colours(painted, lines, added)
    lit = added | eye
    for row in frame.rows:
        same = (row == sword).all(-1)
        row[inside & same] = HOOD_BLACK
        row[lit & same] = painted[lit & same]
