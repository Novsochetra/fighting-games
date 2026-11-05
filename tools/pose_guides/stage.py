"""Stands a posed skeleton on the pitch, facing one of the game's directions, and projects it the
way the game's camera sees it: from the south and above, a sprite's height kept, the ground squashed.
"""

import numpy as np

from skeleton import HEAD_RADIUS, NEUTRAL, body_points

FRAME = (64, 62)
ANCHOR = (32, 61)
BALL_RADIUS = 3
GUIDE_SCALE = 4
GROUND_SQUASH = 0.25

FACINGS = {
    'south': (0, -1),
    'south-east': (0.7071, -0.7071),
    'east': (1, 0),
    'north-east': (0.7071, 0.7071),
    'north': (0, 1),
}


def basis(direction):
    forward_x, forward_y = FACINGS[direction]
    forward = np.array([forward_x, forward_y, 0])
    left = np.array([-forward_y, forward_x, 0])

    return np.column_stack([forward, left, [0, 0, 1]])


def lowest(points):
    lows = [point[2] for name, point in points.items() if name != 'head']

    return min(min(lows), points['head'][2] - HEAD_RADIUS)


def below_feet_line(world):
    """How far the lowest point is drawn below the feet line: a foot toward the camera is drawn lower
    than one away from it, so standing on the grass is not the same as standing on the line."""
    screen_drops = [-(point[2] + point[1] * GROUND_SQUASH) for name, point in world.items() if name != 'head']

    return max(screen_drops)


def fitted(world, width, anchor):
    """Slides a pose sideways into its frame when a limb or the head would be cut off its edge."""
    edges = [(point[0] - HEAD_RADIUS, point[0] + HEAD_RADIUS) if name == 'head' else (point[0] - 1.5, point[0] + 1.5)
             for name, point in world.items() if name != 'ball']
    left = anchor[0] + min(edge[0] for edge in edges)
    right = anchor[0] + max(edge[1] for edge in edges)
    shift = 1 - left if left < 1 else (width - 1 - right if right > width - 1 else 0)

    if right - left > width - 2:
        shift = width / 2 - (left + right) / 2

    return {name: point + np.array([shift, 0, 0]) for name, point in world.items()}


def staged(pose, direction, frame=FRAME, anchor=ANCHOR):
    """World points (x east, y north, z up), feet on the grass, the ball's centre if there is one."""
    pose = {**NEUTRAL, **pose}
    turn = basis(direction)
    points, face_forward, face_left = body_points(pose)
    offset = turn @ np.array([pose['fwd'], pose['side'], 0])
    world = {name: turn @ point + offset for name, point in points.items()}
    lift = below_feet_line({name: point - np.array([0, 0, lowest(world)]) for name, point in world.items()})
    lift += pose['air'] - lowest(world)
    world = {name: point + np.array([0, 0, lift]) for name, point in world.items()}
    world = fitted(world, frame[0], anchor)
    ball = pose['ball']

    if ball is not None:
        world['ball'] = turn @ np.array([ball[0], ball[1], 0]) + np.array([0, 0, ball[2] if len(ball) > 2 else BALL_RADIUS])

    return world, turn @ face_forward, turn @ face_left


def project(point, anchor=ANCHOR):
    """A world point to frame pixels at 1x."""
    return anchor[0] + point[0], anchor[1] - point[2] - point[1] * GROUND_SQUASH


def nearness(point):
    """Larger is nearer the camera, which looks from the south and a little above."""
    return -point[1] + point[2] * 0.25
