"""The Blue Shade's face where a side view draws it only as the lit line down the front of his mask
(blue_line.py): the line gets the short chin and the one eye the faces drawn from a plate have
(blue_mask.py). Both are set from the foot of the line, so they keep still on the face as his head
bobs through a loop. A line the frame drew two pixels thick is thinned to its front, its back half
going dark with the face, as the other frames draw it."""
import numpy as np
from scipy import ndimage as nd
from .paint import EIGHT
from .blue_line import at, drawn_chin, face_line, masks_of, run_back
from .blue_palette import PALE

CHIN = 3
EYE_UP, EYE_BACK = 2, 2
# a line lit two pixels thick on this many of its rows or more is a slab, not a line
SLAB_ROWS = 3
# a few lit pixels alone in the dark this near behind the line are the frame's own eye: it keeps it
LARGEST_EYE, EYE_REACH = 4, 5
NEIGHBOURS = [(dx, dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if dx or dy]


# where the frame drew the chin itself the line steps back at its foot, or a lit run reaches back
# from it
def chin_drawn(masks, line):
    straight, steps = drawn_chin(line)
    return bool(steps) or any(x - run_back(masks['lit'], x, y) >= 2 for x, y in straight[-2:])


def eye_drawn(masks, line):
    labels, count = nd.label(masks['lit'], structure=EIGHT)
    sizes = np.bincount(labels.ravel(), minlength=count + 1)
    ring = nd.binary_dilation(masks['lit'], structure=EIGHT) & ~masks['lit']
    back = min(run_back(masks['lit'], x, y) for x, y in line)
    for x, y in line:
        for label in set(labels[y, back - EYE_REACH:back - 1].tolist()) - {0}:
            piece = labels == label
            edge = nd.binary_dilation(piece, structure=EIGHT) & ring
            if sizes[label] <= LARGEST_EYE and masks['dark'][edge].all():
                return True
    return False


def chin_of(masks, foot):
    x, y = foot
    chin = []
    for back in range(1, CHIN + 1):
        if not at(masks['collar'], x - back, y):
            break
        chin.append((x - back, y))
    return chin


def alone(masks, x, y):
    lit_near = any(at(masks['lit'], x + dx, y + dy) for dx, dy in NEIGHBOURS)
    return at(masks['dark'], x, y) and not lit_near


# the eye sits in the dark just behind the line, a little above the foot, or a row or two higher
# where his collar rises behind his chin or his armour's glow lies close under it; never above the
# line's top, out on the hood
def eye_of(masks, line):
    for up in (EYE_UP, EYE_UP + 1, EYE_UP + 2):
        y = line[-1][1] - up
        near = [run_back(masks['lit'], px, py) for px, py in line if abs(py - y) <= 1]
        if y >= line[0][1] and near and alone(masks, min(near) - EYE_BACK, y):
            return min(near) - EYE_BACK, y
    return None


# the lit pixels behind the line on its rows, where the frame drew it as a slab
def slab_of(masks, line):
    behind = np.zeros_like(masks['lit'])
    for x, y in line:
        behind[y, run_back(masks['lit'], x, y):x] = True
    return behind if np.count_nonzero(behind.any(1)) >= SLAB_ROWS else np.zeros_like(behind)


# the masks with the slab's back half gone dark, so the chin runs back over it
def thinned(masks, slab):
    return {**masks, 'lit': masks['lit'] & ~slab, 'dark': masks['dark'] | slab,
            'collar': masks['collar'] | slab}


def profile(sword, glow, cape):
    masks = masks_of(sword, glow)
    line = face_line(masks, cape['head'], cape['guard'])
    if line is None:
        return None
    straight, _ = drawn_chin(line)
    eye = None if eye_drawn(masks, straight) else eye_of(masks, straight)
    slab = slab_of(masks, straight)
    thin = thinned(masks, slab)
    chin = [] if chin_drawn(thin, line) else chin_of(thin, straight[-1])
    return (straight, chin, eye, slab) if eye else None


def dress_profile(frame, sword, hood_black):
    face = profile(sword, frame.glow, frame.extra['cape'])
    if face is None:
        return
    line, chin, eye, slab = face
    edge = sword[line[-1][1], line[-1][0]]
    marks = {(int(x), int(y)): hood_black for x, y in zip(*np.nonzero(slab.T))}
    marks.update({point: edge for point in chin})
    marks[eye] = PALE
    for row in frame.rows:
        for (x, y), color in marks.items():
            if (row[y, x] == sword[y, x]).all():
                row[y, x] = color
