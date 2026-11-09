"""Sees the hero's shapes through the game's camera: from the south and above, ground squashed by a
quarter, one ray per pixel. Gives each pixel its part, material, depth and lighting."""

import numpy as np

from sdf import smooth_min

WIDTH = 100
HEIGHT = 112
GROUND_ROW = 109
GROUND_SQUASH = 0.25
BLEND = {'head': 2.5, 'torso': 3.0, 'shorts': 2.0, 'hair': 1.2}
LIMB_BLEND = 1.6
LIGHT = np.array([-0.55, -0.5, 0.95])

FACINGS = {
    'south': (0, -1),
    'south-east': (0.7071, -0.7071),
    'east': (1, 0),
    'north-east': (0.7071, 0.7071),
    'north': (0, 1),
}


def body_frame(points, facing):
    forward_x, forward_y = facing
    right = points[:, 0] * forward_y - points[:, 1] * forward_x
    forward = points[:, 0] * forward_x + points[:, 1] * forward_y

    return np.stack([right, forward, points[:, 2]], axis=1)


def part_distances(parts, points):
    return np.stack([distance(points) for _, _, _, distance in parts], axis=1)


def scene_distance(parts, distances):
    blends = {}

    for index, (_, _, blend, _) in enumerate(parts):
        k = BLEND.get(blend, LIMB_BLEND)
        column = distances[:, index]
        blends[blend] = column if blend not in blends else smooth_min(blends[blend], column, k)

    return np.min(np.stack(list(blends.values()), axis=1), axis=1)


def rays():
    columns, rows = np.meshgrid(np.arange(WIDTH), np.arange(HEIGHT))
    screen_up = GROUND_ROW + 0.5 - (rows + 0.5)
    start_y = -60.0
    origins = np.stack([columns + 0.5 - WIDTH / 2, np.full(columns.shape, start_y),
                        screen_up - GROUND_SQUASH * start_y], axis=-1).reshape(-1, 3)
    direction = np.array([0, 1, -GROUND_SQUASH])

    return origins, direction / np.linalg.norm(direction)


def march(parts, facing, steps=160):
    origins, direction = rays()
    travelled = np.zeros(len(origins))
    hit = np.zeros(len(origins), bool)

    for _ in range(steps):
        live = ~hit & (travelled < 140)
        points = body_frame(origins[live] + travelled[live, None] * direction, facing)
        distance = scene_distance(parts, part_distances(parts, points))
        travelled[live] += np.maximum(distance * 0.7, 0.02)
        hit[np.flatnonzero(live)[distance < 0.04]] = True

    return origins + travelled[:, None] * direction, hit


def normals(parts, points, facing):
    eps = 0.25
    gradient = []

    for axis in range(3):
        offset = np.zeros(3)
        offset[axis] = eps
        ahead = scene_distance(parts, part_distances(parts, body_frame(points + offset, facing)))
        behind = scene_distance(parts, part_distances(parts, body_frame(points - offset, facing)))
        gradient.append(ahead - behind)

    gradient = np.stack(gradient, axis=1)

    return gradient / np.maximum(np.linalg.norm(gradient, axis=1, keepdims=True), 1e-6)


def occlusion(parts, points, normal, facing):
    shade = np.zeros(len(points))

    for step in (1.0, 2.5, 4.5):
        probe = body_frame(points + normal * step, facing)
        shade += np.clip(step - scene_distance(parts, part_distances(parts, probe)), 0, None) / step

    return np.clip(1 - shade / 3, 0, 1)


def render(parts, facing):
    points, hit = march(parts, facing)
    found = points[hit]
    distances = part_distances(parts, body_frame(found, facing))
    normal = normals(parts, found, facing)
    light = LIGHT / np.linalg.norm(LIGHT)
    lit = normal @ light
    shadowed = occlusion(parts, found, normal, facing)
    part = np.full(WIDTH * HEIGHT, -1)
    part[hit] = np.argmin(distances, axis=1)
    depth = np.full(WIDTH * HEIGHT, np.inf)
    depth[hit] = found[:, 1] + 0.0
    height = np.full(WIDTH * HEIGHT, np.nan)
    height[hit] = found[:, 2]
    local = np.full((WIDTH * HEIGHT, 3), np.nan)
    local[hit] = body_frame(found, facing)
    brightness = np.zeros(WIDTH * HEIGHT)
    brightness[hit] = lit
    open_sky = np.ones(WIDTH * HEIGHT)
    open_sky[hit] = shadowed

    return {'part': part.reshape(HEIGHT, WIDTH), 'depth': depth.reshape(HEIGHT, WIDTH),
            'brightness': brightness.reshape(HEIGHT, WIDTH), 'open': open_sky.reshape(HEIGHT, WIDTH), 'height': height.reshape(HEIGHT, WIDTH),
            'local': local.reshape(HEIGHT, WIDTH, 3)}
