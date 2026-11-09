"""The hairstyles built in 3D, each its hair and its stubble as lists of shapes in the hero's frame (u right, v forward, z
up). The hero's spikes are drawn by hand instead, in hair_art/."""

from functools import partial

from hair_shapes import cap, clipped_ball, spike


def buzz():
    return [partial(cap, thickness=0.9, forehead=89)], []


def mohawk():
    """A crest from brow to nape, the sides shaved to stubble."""
    crest = clipped_ball((0, -0.8, 88.5), (2.6, 11.4, 5.6), forehead=86, nape=74)
    spikes = [spike((0, forward, 1), 5, 3.2, bend=(0, -2.5, 0.5)) for forward in (0.7, 0.25, -0.2, -0.65)]

    return [crest] + spikes, [partial(cap, thickness=0.45, forehead=88)]


def bowl():
    return [partial(cap, thickness=2.0, forehead=88), clipped_ball((0, -1.4, 84.5), (14.2, 13.4, 12.6), forehead=88)], []


def STYLES():
    return {'buzz': buzz(), 'mohawk': mohawk(), 'bowl': bowl()}
