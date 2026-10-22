"""The Blue Shade's look: cold steel, no shadow. Its flat black cape gets a frost rim, folds and a
rimed hem; ice motes drift off it and a cold mist curls round its feet; its armour seams and blade
burn ice-white, and its face is the dark mask of its design, lit at the edge (blue_head.py)."""
import numpy as np
from scipy import ndimage as nd
from .blue_air import dress_air
from .blue_cape import dress_cape
from .blue_glow import dress_glow, specks_by
from .blue_head import HOOD_BLACK, dress_face
from .blue_touchups import touch_up
from .paint import shifted

SIDES = ((1, 0), (-1, 0), (0, 1), (0, -1))


# whatever the effects lay on a frame's outermost pixels would be cut off where frames meet
def keep_margin(frame, before):
    for row, empty in zip(frame.rows, before):
        border = empty.copy()
        border[1:-1, 1:-1] = False
        row[border] = 0


def slits_of(row, sword):
    solid = row[..., 3] > 0
    across = shifted(solid, 1, 0) & shifted(solid, -1, 0)
    along = shifted(solid, 0, 1) & shifted(solid, 0, -1)
    return ~solid & (sword[..., 3] > 0) & (across | along)


# a spear or axe drawn on the blade's line can leave a pixel's slit of open air where the blade lay
# against him; it is closed in his outline's black, again and again, since where a slanting slit
# steps sideways it is two pixels wide and only shut in once the pixels round it are closed
def close_slits(frame):
    for row in frame.rows[1:]:
        slits = slits_of(row, frame.sword)
        while slits.any():
            row[slits] = HOOD_BLACK
            slits = slits_of(row, frame.sword)


# in a weapon's row a pixel of open air its recoloured swing shuts in all round would show through
# the swing as a hole: it takes the colour most of the swing round it has
def fill_swing_specks(frame):
    for row in frame.rows[1:]:
        swing = (row != frame.sword).any(-1) & (row[..., 3] > 0)
        shut = row[..., 3] == 0
        for dx, dy in SIDES:
            shut &= shifted(swing, dx, dy)
        for y, x in zip(*np.nonzero(shut)):
            sides = np.array([row[y - dy, x - dx] for dx, dy in SIDES])
            colours, counts = np.unique(sides, axis=0, return_counts=True)
            row[y, x] = colours[counts.argmax()]


# a mote shed against his outline can shut a speck of open air in between them, which shows as a
# hole: it is not drawn there
def unshut_specks(frame, before):
    for row, was in zip(frame.rows, before):
        motes = (row != was).any(-1) & (row[..., 3] == 255)
        shut = specks_by(row, motes) & specks_by(row, was[..., 3] > 0)
        shut &= ~specks_by(was, np.ones_like(motes))
        lifted = nd.binary_dilation(shut) & motes
        row[lifted] = was[lifted]


def dress_strip(frames):
    for frame in frames:
        close_slits(frame)
        fill_swing_specks(frame)
        plain = [row.copy() for row in frame.rows]
        dress_cape(frame, plain)
        dress_face(frame, plain[0])
        dress_glow(frame, plain[0], plain[1] if len(plain) > 1 else None)
        frame.extra['empty'] = [row[..., 3] == 0 for row in plain]
    before = [[row.copy() for row in frame.rows] for frame in frames]
    dress_air(frames)
    for frame, rows in zip(frames, before):
        unshut_specks(frame, rows)
        keep_margin(frame, frame.extra['empty'])
        touch_up(frame)
