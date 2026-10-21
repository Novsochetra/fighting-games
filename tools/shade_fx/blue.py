"""The Blue Shade's look: cold steel, no shadow. Its flat black cape gets a frost rim, folds and a
rimed hem; ice motes drift off it and a cold mist curls round its feet; its armour seams and blade
burn ice-white, and its face is the dark mask of its design, lit at the edge (blue_head.py)."""
from .blue_air import dress_air
from .blue_cape import dress_cape
from .blue_glow import dress_glow
from .blue_head import HOOD_BLACK, dress_face
from .paint import shifted


# whatever the effects lay on a frame's outermost pixels would be cut off where frames meet
def keep_margin(frame, before):
    for row, empty in zip(frame.rows, before):
        border = empty.copy()
        border[1:-1, 1:-1] = False
        row[border] = 0


# a spear or axe drawn on the blade's line can leave a pixel's slit of open air where the blade lay
# against him; it is closed in his outline's black
def close_slits(frame):
    for row in frame.rows[1:]:
        solid = row[..., 3] > 0
        across = shifted(solid, 1, 0) & shifted(solid, -1, 0)
        along = shifted(solid, 0, 1) & shifted(solid, 0, -1)
        row[~solid & (frame.sword[..., 3] > 0) & (across | along)] = HOOD_BLACK


def dress_strip(frames):
    for frame in frames:
        close_slits(frame)
        plain = [row.copy() for row in frame.rows]
        dress_cape(frame, plain)
        dress_face(frame, plain[0])
        dress_glow(frame, plain[0], plain[1] if len(plain) > 1 else None)
        frame.extra['empty'] = [row[..., 3] == 0 for row in plain]
    dress_air(frames)
    for frame in frames:
        keep_margin(frame, frame.extra['empty'])
