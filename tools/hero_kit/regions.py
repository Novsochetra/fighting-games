"""Where the kit's trims sit on the body, in the hero's frame (u right, v forward, z up), so the
V of the neck, the cuffs, the stripes down the shorts and the sock tops agree in every direction."""

import numpy as np


SOCK_TOP = 23.5
SOCK_BAND = 1.6
CUFF = 1.3
SLEEVE_END = 56.4
TRIM = 1.4
SOLE = 2.0
STRIPE_FROM, STRIPE_TO = 36, 56
NECK_REACH = 6.6
LEG_PARTS = ('thigh', 'shin', 'calf')


def neckline(u, v):
    """A V: the collar's height, dipping at the front of the neck."""
    front = np.clip(v / 6, 0, 1)
    middle = np.clip(1 - np.abs(u) / 4.6, 0, 1)

    return 66.8 - 3.0 * front * middle


def short_stripe(u, v, z):
    """The stripe down each leg of the shorts, a little in front of the side seam, a band of even
    width round the leg's own axis."""
    along = np.clip((41 - z) / 13, 0, 1)
    axis_u = 6.8 + 4.8 * along
    axis_v = -0.2 + 0.4 * along
    angle = np.degrees(np.arctan2(v - axis_v, np.abs(u) - axis_u))

    return (angle > STRIPE_FROM) & (angle < STRIPE_TO) & (z < 44)


BOOT_CENTRE_U, BOOT_TURN = 15.4, 16


def boot_frame(u, v):
    """A point in its boot's own frame: across the boot and along it, toe forward."""
    side = np.sign(u)
    radians = np.radians(-side * BOOT_TURN)
    across = u - side * BOOT_CENTRE_U
    along = across * np.sin(radians) + v * np.cos(radians)
    across = across * np.cos(radians) - v * np.sin(radians)

    return across, along


def boot_parts(u, v, z):
    """The laces down the instep and the stiff heel at the back of each boot."""
    across, along = boot_frame(u, v)
    laces = (np.abs(across) < 1.4) & (along > -0.5) & (along < 6.5) & (z > 4.6)
    heel = (along < -5.6) & (z > 2.2) & (z < 6.6) & (np.abs(across) < 2.6)

    return laces, heel


def raglan(u, v, z):
    """The raglan seam's trim, from the collar down over each shoulder to the armpit, on the front
    only, as the reference shows it; behind, a seam beside the number reads as part of it."""
    across = np.abs(u)
    line = 66.4 - (across - 5.2) * 1.5

    return (across > 5.2) & (across < 10) & (np.abs(z - line) < 0.8) & (v > -1)


def regions(names, material, local):
    u, v, z = local[..., 0], local[..., 1], local[..., 2]
    leg = np.isin(names, [f'{name}{side}' for name in LEG_PARTS for side in (1, -1)])
    sleeve = np.char.startswith(names.astype(str), 'sleeve')
    material = material.copy()
    material[leg & (z < SOCK_TOP)] = 'socks'
    shirt = material == 'shirt'
    line = neckline(u, v)
    near_neck = np.hypot(u, v + 0.6) < NECK_REACH + 3.2 * np.clip(v / 6, 0, 1)
    material[shirt & near_neck & (z > line)] = 'skin'
    material[shirt & near_neck & (z <= line) & (z > line - TRIM)] = 'trim'
    material[sleeve & (material == 'shirt') & (z < SLEEVE_END + CUFF)] = 'trim'
    material[(material == 'shirt') & ~sleeve & raglan(u, v, z)] = 'trim'
    material[(material == 'shorts') & short_stripe(u, v, z)] = 'stripe'
    boots = material == 'boots'
    laces, heel = boot_parts(u, v, z)
    material[boots & laces] = 'lace'
    material[boots & heel] = 'heel'
    material[boots & (z < SOLE)] = 'sole'

    return material
