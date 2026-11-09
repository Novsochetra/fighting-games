"""Turns a render into pixel art: each pixel a shade of its material's ramp, with outlines around
the figure and wherever one part stands in front of another."""

import numpy as np

from regions import regions

LIT = 0.28
CLOTH_LIT = 0.08
HIGHLIGHT = 2.0
CREVICE = 0.55
DEPTH_JUMP = 3.0


def materials_of(parts, render):
    names = np.array([name for name, _, _, _ in parts] + [''])
    kinds = np.array([material for _, material, _, _ in parts] + [''])
    part = render['part']

    return regions(names[part], kinds[part], render['local'])


HAIR_LIT, HAIR_HIGHLIGHT = 0.42, 0.975


def shades_of(render, material=None):
    """0 crevice, 1 shadow, 2 lit, 3 highlight: a base most of the form, a shadow turned away from
    the light, a small highlight where it faces it, and the darkest only where forms meet."""
    lit = render['brightness']
    hair = material == 'hair' if material is not None else np.zeros(lit.shape, bool)
    cloth = np.isin(material, ['shirt', 'shorts']) if material is not None else hair
    threshold = np.where(hair, HAIR_LIT, np.where(cloth, CLOTH_LIT, LIT))
    shade = np.where(lit < threshold, 1, 2)
    shade = np.where(lit > np.where(hair, HAIR_HIGHLIGHT, HIGHLIGHT), 3, shade)

    return np.where(render['open'] < CREVICE, np.minimum(shade - 1, 1), shade).clip(0, 3)


def tidy(shade, material, passes=2):
    """Drops lone pixels of a shade: each takes the shade most of its same-material neighbours hold."""
    height, width = shade.shape

    for _ in range(passes):
        padded = np.pad(shade, 1, constant_values=-1)
        same = np.pad(material, 1, constant_values='')
        votes = np.zeros((4, height, width), int)

        for dy in (0, 1, 2):
            for dx in (0, 1, 2):
                if dy == 1 and dx == 1:
                    continue

                near = padded[dy:dy + height, dx:dx + width]
                alike = same[dy:dy + height, dx:dx + width] == material

                for level in range(4):
                    votes[level] += alike & (near == level)

        own = np.take_along_axis(votes, shade[None], axis=0)[0]
        best = votes.argmax(axis=0)
        shade = np.where((own <= 1) & (votes.max(axis=0) >= 4), best, shade)

    return shade


def ramp_shade(shade, shades):
    return int(np.clip(shade - (4 - shades), 0, shades - 1))


def edges(material, depth):
    filled = material != ''
    height, width = filled.shape
    padded = np.pad(filled, 1)
    outline = np.zeros(filled.shape, bool)

    for dy, dx in ((0, 1), (2, 1), (1, 0), (1, 2)):
        outline |= filled & ~padded[dy:dy + height, dx:dx + width]

    safe_depth = np.where(filled, depth, 1e9)

    for axis in (0, 1):
        for shift in (1, -1):
            other_depth = np.roll(safe_depth, shift, axis=axis)
            other_material = np.roll(material, shift, axis=axis)
            both = filled & np.roll(filled, shift, axis=axis)
            jump = both & (safe_depth - other_depth > DEPTH_JUMP)
            change = both & (material != other_material) & (safe_depth - other_depth > 0.8)
            outline |= jump | change

    return outline
