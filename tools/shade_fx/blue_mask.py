"""The Blue Shade's mask as his design draws it: black in the hood, lit only along its edge where the
face meets the hood's opening (its front and chin from the side, both sides and the chin from the
front), with one eye. The plate it is drawn from is found in blue_head.py."""
import numpy as np
from scipy import ndimage as nd
from .paint import EIGHT, hsv, ramp_by_light, shifted
from .blue_palette import ICY_EYE_CUTS, ICY_EYES

# a step in the plate's outline this long or shorter is bridged so the lit edge runs unbroken, and
# a lit piece this small left apart from the rest of the edge is a speck of the plate gone dark
LONGEST_GAP = 3
LARGEST_SPECK = 2
EYE_WHITE = 150
# the hero's own eye is a few warm or pale pixels at the plate, never a run of blade
EYE_REACH = 2
LARGEST_EYE = 6
EYE_BACK = 2


# seen from the side the face's front meets the open air; seen from the front the hood wraps it on
# both sides
def side_view(plate, sword):
    front = plate & ~shifted(nd.binary_fill_holes(plate), -1, 0)
    air = sword[..., 3] == 0
    ahead = shifted(air, -1, 0) | shifted(air, -2, 0) | shifted(air, -3, 0)
    return (front & ahead).sum() * 2 >= front.sum()


# seen from the front the hood's brim shades the top of the face, so where the face rounds in above
# its widest row, the edge facing up stays dark: its lit edge is a U, never a ring closing over the brow
def brow_of(whole):
    widths = whole.sum(1)
    brow = np.zeros_like(whole)
    brow[:int(np.argmax(widths))] = True
    return brow & ~shifted(whole, 0, 1)


def outline(plate, sword):
    whole = nd.binary_fill_holes(nd.binary_closing(plate, structure=EIGHT)) | plate
    edge = ~shifted(whole, -1, 0) | ~shifted(whole, 0, -1)
    if not side_view(plate, sword):
        edge = (edge | ~shifted(whole, 1, 0)) & ~brow_of(whole)
    return whole & edge


# where the plate steps in under the edge of the face's outline, the edge is lit across the step
def bridges(lines, rim):
    gaps, count = nd.label(rim & ~lines, structure=EIGHT)
    pieces, _ = nd.label(lines, structure=EIGHT)
    bridged = np.zeros_like(lines)
    for label in range(1, count + 1):
        gap = gaps == label
        ends = pieces[nd.binary_dilation(gap, structure=EIGHT)]
        if gap.sum() <= LONGEST_GAP and len(np.unique(ends[ends > 0])) >= 2:
            bridged |= gap
    return bridged


def without_strays(lines):
    labels, count = nd.label(lines, structure=EIGHT)
    if count < 2:
        return lines
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    return lines & ((sizes > LARGEST_SPECK) | (sizes == sizes.max()))[labels]


# the lit edge, the pixels added to close it, and the dark inside
def face_lines(plate, sword):
    rim = outline(plate, sword)
    lines = rim & plate
    added = bridges(lines, rim) & ~plate
    lines = without_strays(lines | added)
    return lines, added & lines, plate & ~lines


# an added pixel takes the colour of the lit edge it closes
def bridge_colours(sword, lines, added):
    out = sword.copy()
    lit = lines & ~added
    for y, x in zip(*np.nonzero(added)):
        ys, xs = np.nonzero(lit[max(0, y - 1):y + 2, max(0, x - 1):x + 2])
        if len(ys):
            out[y, x] = sword[max(0, y - 1) + ys[0], max(0, x - 1) + xs[0]]
    return out


# a source frame's own eye: a few warm or pale pixels at the plate, inside or just over it, never
# under its chin, where a gauntlet's dull brown passes for warm
def eye_drawn(sword, plate):
    hue, sat, val = hsv(sword)
    warm = ((hue < 50) | (hue > 340)) & (sat > 0.15) & (val > 0.4)
    light = (sword[..., 3] > 0) & (warm | (sword[..., :3].min(-1) >= EYE_WHITE)) & ~plate
    light[np.nonzero(plate)[0].max():] = False
    labels, count = nd.label(light, structure=EIGHT)
    near = nd.binary_dilation(plate, structure=EIGHT, iterations=EYE_REACH)
    sizes = np.bincount(labels.ravel(), minlength=count + 1)
    touching = np.bincount(labels[near], minlength=count + 1)
    keep = (sizes <= LARGEST_EYE) & (touching > 0)
    keep[0] = False
    return keep[labels]


# where the frame drew none, the eye is set in the dark of the face a little behind its front
def eye_added(lines, inside):
    ys = np.nonzero(lines | inside)[0]
    for row in range(ys.min() + max(2, (ys.max() - ys.min()) // 3), ys.max()):
        lit, dark = np.flatnonzero(lines[row]), np.flatnonzero(inside[row])
        if len(lit) and len(dark):
            dark = dark[dark <= lit.max() - EYE_BACK]
        if len(lit) and len(dark):
            eye = np.zeros_like(inside)
            eye[row, dark.max()] = True
            return eye
    return np.zeros_like(inside)


# the drawn eye turns to ice whatever colour the frame gave it, so every face has the one look
def eye_painted(sword, plate):
    eye = eye_drawn(sword, plate)
    return eye, ramp_by_light(sword, eye, ICY_EYES, ICY_EYE_CUTS)
