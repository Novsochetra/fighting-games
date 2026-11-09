"""Gear worn over the kit, as shapes in the hero's frame, so it turns with him: (material, shape)."""

from functools import partial

from hair_shapes import SKULL_CENTRE, SKULL_RADII
from model import ELBOW, FIST, SHOULDER, WRIST, mirrored
from sdf import clipped, cone, ellipsoid, round_box, sphere


def along(start, end, amount):
    return tuple(a + (b - a) * amount for a, b in zip(start, end))


def wristbands():
    return [('gear', partial(cone, start=mirrored(side, along(WRIST, ELBOW, -0.05)),
                             end=mirrored(side, along(WRIST, ELBOW, 0.32)), start_radius=3.9, end_radius=4.2))
            for side in (1, -1)]


def captain_band():
    left = -1

    return [('gear', partial(cone, start=mirrored(left, along(SHOULDER, ELBOW, 0.62)),
                             end=mirrored(left, along(SHOULDER, ELBOW, 0.88)), start_radius=5.6, end_radius=5.4))]


def headband():
    centre = tuple(SKULL_CENTRE + [0, 0, 7.4])
    radii = tuple(SKULL_RADII[:2] + 2.2) + (4.6,)
    band = clipped(partial(ellipsoid, centre=centre, radii=radii), below=centre[2] - 1.6, above=centre[2] + 1.6)
    knot = partial(sphere, centre=(1.5, SKULL_CENTRE[1] - SKULL_RADII[1] - 2.6, centre[2]), radius=1.8)
    tails = [partial(cone, start=(1.5, -12.6, centre[2]), end=(side * 3 + 1.5, -14.5, centre[2] - 8),
                     start_radius=1.4, end_radius=0.9) for side in (1, -0.4)]

    return [('gear', band), ('gear', knot)] + [('gear', tail) for tail in tails]


def keeper_gloves():
    return [('gear', partial(round_box, centre=mirrored(side, (FIST[0] + 0.4, FIST[1], FIST[2] - 0.6)),
                             half=(5, 5.4, 5.8), radius=3.2)) for side in (1, -1)] + [
        ('gear', partial(cone, start=mirrored(side, along(WRIST, ELBOW, -0.1)),
                         end=mirrored(side, along(WRIST, ELBOW, 0.3)), start_radius=4.6, end_radius=4.4))
        for side in (1, -1)]


GEAR = {
    'wristbands': wristbands,
    'captain-band': captain_band,
    'headband': headband,
    'keeper-gloves': keeper_gloves,
}
