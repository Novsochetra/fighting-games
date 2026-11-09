"""The hairstyles built in 3D, each its hair and its stubble as lists of shapes in the hero's frame (u right, v forward, z
up). The hero's spikes are drawn by hand instead, in hair_art/."""

from functools import partial

from hair_shapes import cap


def buzz():
    return [partial(cap, thickness=0.9, forehead=89)], []


def shaved():
    """Clipped to stubble; the mohawk's crest is drawn over it by hand (hair_art/mohawk_*)."""
    return [], [partial(cap, thickness=0.45, forehead=88)]


def STYLES():
    return {'buzz': buzz(), 'shaved': shaved()}
