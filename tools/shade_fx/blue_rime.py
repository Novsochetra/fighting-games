"""Frost on the Blue Shade's cape: jagged rime growing up from its hem and in from the lower part
of its back edge, white at the edge and fading into the black cloth, and icicles hanging off the
hem. Only the cape's lowest edge freezes white: where its hem rises from its lowest point toward
his body (the cape's underside swept back behind him) or its edge lies over his own limbs, the rime
starts in the deep ice, so it never reads as a white streak or a blade left lying across him. A tip
of cloth too thin to hold the rime frosts only along its edge."""
import numpy as np
from scipy import ndimage as nd
from .frames import without_specks
from .paint import CROSS, EIGHT, box, shifted
from .blue_palette import DEEP, FROST, ICE, NAVY, PALE

RIME_STEPS = (FROST, PALE, ICE, ICE, DEEP, NAVY)
SPIKES = (2, 3, 6, 3, 1, 2, 4, 1, 2, 5, 2, 1, 1, 3, 2, 4, 1, 2)
# the needles growing in from the back edge lie a row apart, or they would freeze into one block
NEEDLES = (0, 2, 0, 1, 4, 0, 0, 2, 0, 5, 1, 0, 0, 3, 0)
# how far down the back edge the frost starts, as a share of the cape's height
BACK_FROST_FROM = 0.6
# a hem this far down the cape or higher frosts at its thinnest
HIGH_HEM = 0.5
THINNEST_HEM = 0.25
ICICLE_FROM = 5
ICICLE = (PALE, ICE)
FEET_Y = 76
# a hem this many rows above its lowest point, in front of it, starts its rime this far down the
# steps: the rows just above the lowest still frost, the rest of a rising hem starts in the deep ice
FROSTED_RISE = 1
DEEP_STEP = 4
# cloth with his own body this few rows under it lies across him, or this near on both sides of it
LYING_GAP = 3
SQUEEZE = 4
SMALLEST_LIMB = 12
# cloth no block this wide fits in (a tiny tip of the hem) would freeze solid white
THINNEST_CLOTH = 3


def grow(steps, cloth, start, direction, length, first=0):
    x, y = start
    for step in range(min(length, len(steps) - first)):
        if not (0 <= y < cloth.shape[0] and 0 <= x < cloth.shape[1]) or not cloth[y, x]:
            return
        steps[first + step][y, x] = True
        x, y = x + direction[0], y + direction[1]


# a hem high up the cape, a skirt's between the legs, frosts thinner than the cape's lowest edge
def hem_reach(y, bounds):
    down = (y - bounds[0]) / max(1, bounds[1] - bounds[0])
    return min(1.0, max(THINNEST_HEM, (down - HIGH_HEM) / (1 - HIGH_HEM)))


# his body away from the cape: the limbs a fallen cape lies across, never a thin tip of the cape itself
def limbs_of(parts, body):
    return without_specks(body & ~nd.binary_dilation(parts['cape'], structure=EIGHT), SMALLEST_LIMB)


# cloth with his limbs a few rows under it lies across him, and cloth with his limbs close on both
# sides of it (a hem fallen between his boots and his body) lies among them
def over_limbs(limbs):
    over, left, right = (np.zeros_like(limbs) for _ in range(3))
    for depth in range(2, 2 + LYING_GAP):
        over |= shifted(limbs, 0, -depth)
    for reach in range(1, 1 + SQUEEZE):
        left |= shifted(limbs, reach, 0)
        right |= shifted(limbs, -reach, 0)
    near = nd.binary_dilation(left, structure=EIGHT) & nd.binary_dilation(right, structure=EIGHT)
    return over | near


# how far each hem pixel rises above the lowest hem lying behind it
def rises_of(hem):
    columns = np.flatnonzero(hem.any(0))
    lowest = np.full(hem.shape[1], -1)
    lowest[columns] = hem.shape[0] - 1 - np.argmax(hem[::-1, columns], axis=0)
    behind = np.concatenate(([-1], np.maximum.accumulate(lowest)[:-1]))
    ys, xs = np.nonzero(hem)
    rises = np.zeros(hem.shape, int)
    rises[ys, xs] = np.maximum(0, behind[xs] - ys)
    return rises


def first_step(over, rise, x, y):
    if over[y, x]:
        return DEEP_STEP
    return 0 if rise <= FROSTED_RISE else min(DEEP_STEP, rise)


# each hem pixel, the length of the spike growing up from it and the step it starts at, the pattern
# starting at the hem's back end so it moves with the cloth
def hem_spikes(hem, bounds, over):
    ys, xs = np.nonzero(hem)
    if len(xs) == 0:
        return []
    back_end, rises = xs.min(), rises_of(hem)
    return [(x, y, max(1, int(round(SPIKES[(x - back_end) % len(SPIKES)] * hem_reach(y, bounds)))),
             first_step(over, rises[y, x], x, y)) for y, x in zip(ys, xs)]


def rime_from_back(steps, cloth, parts, over):
    top, bottom = box(parts['cape'])[:2]
    for y, x in zip(*np.nonzero(parts['back'])):
        down = (y - top) / max(1, bottom - top)
        if down < BACK_FROST_FROM:
            continue
        reach = (down - BACK_FROST_FROM) / (1 - BACK_FROST_FROM)
        first = DEEP_STEP if over[y, x] else 0
        grow(steps, cloth, (x, y), (1, 0), int(round(NEEDLES[(bottom - y) % len(NEEDLES)] * reach)), first)


# the inside of cloth too thin to hold the rime, away from its edge with the open air
def thin_inside(cloth, empty):
    block = np.ones((THINNEST_CLOTH, THINNEST_CLOTH), bool)
    thin = cloth & ~nd.binary_opening(cloth, structure=block)
    return thin & ~nd.binary_dilation(empty, structure=CROSS)


def rime_steps(parts, spikes, over):
    cloth = parts['cape'] | parts['hem'] | parts['back']
    steps = [np.zeros_like(cloth) for _ in RIME_STEPS]
    for x, y, length, first in spikes:
        grow(steps, cloth, (x, y), (0, -1), length, first)
    rime_from_back(steps, cloth, parts, over)
    inside = thin_inside(cloth, parts['empty'])
    return [step & ~inside for step in steps]


# icicles hang under the tallest spikes of the frozen hem, never past the ground the hero stands on
def icicles(parts, spikes):
    drops = [np.zeros_like(parts['hem']) for _ in ICICLE]
    for x, y, length, first in spikes:
        hangs = y + len(ICICLE) <= FEET_Y and parts['empty'][y + 1:y + 1 + len(ICICLE), x].all()
        if length >= ICICLE_FROM and hangs and first == 0:
            for step, drop in enumerate(drops):
                drop[y + 1 + step, x] = True
    return drops


def dress_rime(frame, parts, paint_cloth):
    bounds = box(parts['cape'])
    if bounds is None:
        return
    over = over_limbs(limbs_of(parts, frame.body))
    spikes = hem_spikes(parts['hem'], bounds, over)
    for mask, color in zip(rime_steps(parts, spikes, over), RIME_STEPS):
        paint_cloth(frame, mask, color)
    for mask, color in zip(icicles(parts, spikes), ICICLE):
        for row in frame.rows:
            row[mask & (row[..., 3] == 0) & ~parts['guard']] = color
