"""Where the Firefly Shade is in a frame, and what his fireflies must never cover.

Every frame gets a Scene in `frame.extra['firefly']`: the body's centre and box, his eyes and
blade, the cloak's cloth and the space round his legs, the body pixels a firefly flying in front
of him may cover (all but the blade, smear, every weapon, glowing trim and the face), and the
narrow nooks of air inside his outline where no firefly shows.
"""
from dataclasses import dataclass
import numpy as np
from scipy import ndimage as nd
from .paint import CROSS, EIGHT, box, luma, opaque

FACE_REACH = 6
FACE_SHARE = 0.28
BLADE_LEAST = 8
BLADE_MOST = 90
BLADE_LIGHT = 0.75
BLADE_EDGE = 0.45
BLADE_BLUE = 40
CLOTH_DARKEST = 0.04
CLOTH_LIGHTEST = 0.3
LEG_REACH = 3
NOOK_WIDTH = 2
EYE_MOST = 6
# the eye sits in the top third of him; a lit buckle at his collar sits lower
EYE_HIGHEST = 0.3
# an eye glows inside the black shadow of the hood, so most of the 5x5 round it is near black
EYE_SHADOW = 0.06
EYE_SHADE = 7
EYE_DIM_BLUE = 100
EYE_DIM_TINT = 80


@dataclass
class Scene:
    centre: tuple
    box: tuple
    eyes: np.ndarray
    blade: np.ndarray
    cloth: np.ndarray
    legs: np.ndarray
    open: np.ndarray
    nook: np.ndarray


def scene_of(frame):
    body = frame.body
    top, bottom, left, right = box(body) or (0, frame.height - 1, 0, body.shape[1] - 1)
    ys, xs = np.nonzero(body)
    centre = (float(xs.mean()), float(ys.mean())) if len(xs) else (64.0, 48.0)
    eyes = eyes_of(frame, top, bottom)
    blade = blade_of(frame) & ~nd.binary_dilation(eyes, structure=EIGHT, iterations=FACE_REACH)
    keep = kept_clear(frame, eyes, blade, (top, bottom))
    cloth = cloth_of(frame)
    return Scene(centre=centre, box=(top, bottom, left, right), eyes=eyes, blade=blade, cloth=cloth,
                 legs=legs_of(frame, cloth), open=body & ~keep, nook=nooks_of(frame))


def set_scenes(frames):
    for frame in frames:
        frame.extra['firefly'] = scene_of(frame)


# the hood's eye is the glow highest up in black shadow
def eyes_of(frame, top, bottom):
    sword = frame.sword
    dark = opaque(sword) & (luma(sword) < EYE_SHADOW)
    shade = nd.uniform_filter(dark.astype(float), size=5, mode='constant') * 25
    near_top = np.zeros_like(frame.body)
    near_top[:top + int(EYE_HIGHEST * (bottom - top)) + 1] = True
    found = frame.glow & frame.body & (shade >= EYE_SHADE) & near_top
    if not found.any():
        found = dim_blue(sword) & frame.body & (shade >= EYE_SHADE) & near_top
    labels, count = nd.label(found, structure=EIGHT)
    if count == 0:
        return found
    sizes = np.bincount(labels.ravel())
    small = [label for label in range(1, count + 1) if sizes[label] <= EYE_MOST]
    if not small:
        return np.zeros_like(found)
    highest = min(small, key=lambda label: np.nonzero(labels == label)[0].min())
    return labels == highest


# an eye drawn too dim to pass for glow is still plainly blue; unfound, it went unlit there alone
def dim_blue(sword):
    red, blue = sword[..., 0].astype(int), sword[..., 2].astype(int)
    return opaque(sword) & (blue >= EYE_DIM_BLUE) & (blue - red >= EYE_DIM_TINT)


# where the weapon rows differ the weapon is drawn, so nothing goes there in any row
def weapons_of(frame):
    differs = np.zeros(frame.body.shape, bool)
    for row in frame.rows[1:]:
        differs |= np.any(row != frame.rows[0], axis=-1)
    return differs


# round his eyes, or the top of him when they cannot be seen
def face_of(frame, eyes, span):
    if eyes.any():
        return nd.binary_dilation(eyes, structure=EIGHT, iterations=FACE_REACH)
    top, bottom = span
    face = np.zeros_like(frame.body)
    face[:top + int(FACE_SHARE * (bottom - top)) + 1] = True
    return face & frame.body


def kept_clear(frame, eyes, blade, span):
    lit = frame.glow | frame.smear | blade | weapons_of(frame)
    return nd.binary_dilation(lit, structure=EIGHT) | face_of(frame, eyes, span)


# the blade is a run of cyan glow round a near-white core, smaller than a slash's arc; the weapon
# bake leaves it in every row on frames where it could not find it, and its glow can pass for
# smear, so it is found by its light alone
def blade_of(frame):
    sword = frame.sword
    red, blue = sword[..., 0].astype(int), sword[..., 2].astype(int)
    core = opaque(sword) & (luma(sword) > BLADE_LIGHT)
    cyan = opaque(sword) & (luma(sword) > BLADE_EDGE) & (blue >= red + BLADE_BLUE)
    labels, count = nd.label(core | cyan, structure=EIGHT)
    if count == 0:
        return core
    cores = np.bincount(labels[core], minlength=count + 1)
    sizes = np.bincount(labels.ravel(), minlength=count + 1)
    blades = (cores >= BLADE_LEAST) & (sizes <= BLADE_MOST)
    blades[0] = False
    return blades[labels]


# the cloak's dark green cloth and the black outline round it, not his boots or armour
def cloth_of(frame):
    red, green, blue = (frame.sword[..., channel].astype(int) for channel in range(3))
    light = luma(frame.sword)
    green_cloth = (green > red) & (green >= blue - 4) & (light < CLOTH_LIGHTEST) & (green > 12)
    outline = (light < CLOTH_DARKEST) & nd.binary_dilation(green_cloth, structure=EIGHT)
    return frame.body & (green_cloth | outline)


# his legs, boots and armour and a little round them: a spark born there starts in a gap
def legs_of(frame, cloth):
    return nd.binary_dilation(frame.body & ~cloth, structure=EIGHT, iterations=LEG_REACH)


# the narrow gaps between cloak, legs and blade: a firefly glimpsed in one reads as a stray pixel
def nooks_of(frame):
    solid = opaque(frame.sword) | frame.body
    return nd.binary_closing(solid, structure=CROSS, iterations=NOOK_WIDTH) & ~solid
