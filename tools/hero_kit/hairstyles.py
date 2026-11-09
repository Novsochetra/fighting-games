"""The hairstyles built in 3D, each a list of shapes in the hero's frame (u right, v forward, z
up). The hero's spikes are drawn by hand instead, in hair_art/."""

from functools import partial

from hair_shapes import cap, clipped_ball, spike


def buzz():
    return [partial(cap, thickness=0.9, forehead=89)]


def mohawk():
    return [partial(cap, thickness=0.55, forehead=89)] + [
        spike((0, forward, 1), 6.5, 3, bend=(0, -1.5, 0)) for forward in (0.8, 0.35, -0.1, -0.55, -1)
    ]


def bowl():
    return [partial(cap, thickness=2.0, forehead=88), clipped_ball((0, -1.4, 84.5), (14.2, 13.4, 12.6), forehead=88)]


def STYLES():
    return {'buzz': buzz(), 'mohawk': mohawk(), 'bowl': bowl()}
