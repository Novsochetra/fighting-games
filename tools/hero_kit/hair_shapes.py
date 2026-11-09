"""Shapes hairstyles are built from, in the hero's frame, fitted to his skull."""

from functools import partial

import numpy as np

from sdf import cone, ellipsoid

SKULL_CENTRE = np.array([0, -0.6, 80.6])
SKULL_RADII = np.array([10.2, 10.2, 10.6])


def hairline(points, forehead=85.5, nape=71, temple=79.5):
    """How far a point sits above the hairline: the hair stops over the forehead, clears the ears
    and runs down to the nape."""
    u, v, z = points[:, 0], points[:, 1], points[:, 2]
    toward_front = np.clip((v + 6) / 12, 0, 1) ** 0.8
    line = nape + (forehead - nape) * toward_front
    over_ear = (np.abs(u) > 7) & (v > -4.5) & (v < 1.5)
    line = np.where(over_ear, np.maximum(line, temple), line)

    return z - line


def cap(points, thickness=1.6, **line):
    shell = ellipsoid(points, SKULL_CENTRE, SKULL_RADII + thickness)
    inside = -ellipsoid(points, SKULL_CENTRE, SKULL_RADII - 1.5)

    return np.maximum(np.maximum(shell, inside), -hairline(points, **line))


def lock(points, root, tip, width):
    """A tapered spike or strand from a root on the skull to its tip."""
    return cone(points, root, tip, width, 0.35)


def on_skull(direction, depth=1.5):
    """The point of the skull's surface in a direction from its centre, sunk `depth` into it."""
    direction = np.asarray(direction, float)
    direction = direction / np.linalg.norm(direction)
    scale = 1 / np.sqrt(((direction / SKULL_RADII) ** 2).sum())

    return SKULL_CENTRE + direction * (scale - depth)


def spike(direction, reach, width=3.2, bend=(0, 0, 0)):
    root = on_skull(direction)
    unit = np.asarray(direction, float) / np.linalg.norm(direction)
    tip = on_skull(direction, depth=-reach) + np.asarray(bend, float)

    return partial(lock, root=root - unit * 1.5, tip=tip, width=width)


def clipped_ball(centre, radii, **line):
    def shape(points):
        return np.maximum(ellipsoid(points, centre, radii), -hairline(points, **line))

    return shape
