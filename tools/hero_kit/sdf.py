"""Signed distances of the shapes the hero is modelled from, over arrays of points (N × 3)."""

import numpy as np


def length(vectors):
    return np.sqrt((vectors * vectors).sum(axis=-1))


def sphere(points, centre, radius):
    return length(points - np.asarray(centre, float)) - radius


def ellipsoid(points, centre, radii):
    local = (points - np.asarray(centre, float)) / np.asarray(radii, float)
    k0 = length(local)
    k1 = length(local / np.asarray(radii, float))

    return k0 * (k0 - 1) / np.maximum(k1, 1e-6)


def cone(points, start, end, start_radius, end_radius):
    start, end = np.asarray(start, float), np.asarray(end, float)
    axis = end - start
    along = np.clip(((points - start) @ axis) / (axis @ axis), 0, 1)
    nearest = start + along[:, None] * axis

    return length(points - nearest) - (start_radius + (end_radius - start_radius) * along)


def round_box(points, centre, half, radius):
    local = np.abs(points - np.asarray(centre, float)) - (np.asarray(half, float) - radius)
    outside = length(np.maximum(local, 0))

    return outside + np.minimum(local.max(axis=-1), 0) - radius


def smooth_min(a, b, k):
    if k <= 0:
        return np.minimum(a, b)

    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)

    return b + (a - b) * h - k * h * (1 - h)


def clipped(distance, below=None, above=None):
    """A shape cut flat: nothing of it under z `below` or over z `above`."""

    def cut(points):
        result = distance(points)

        if below is not None:
            result = np.maximum(result, below - points[:, 2])

        if above is not None:
            result = np.maximum(result, points[:, 2] - above)

        return result

    return cut


def turned(distance, centre, degrees):
    """A shape turned about the upright line through `centre`."""
    radians = np.radians(degrees)
    cos, sin = np.cos(radians), np.sin(radians)
    pivot = np.asarray(centre, float)

    def turn(points):
        local = points - pivot
        rotated = np.stack([local[:, 0] * cos - local[:, 1] * sin, local[:, 0] * sin + local[:, 1] * cos, local[:, 2]],
                           axis=1)

        return distance(rotated + pivot)

    return turn
