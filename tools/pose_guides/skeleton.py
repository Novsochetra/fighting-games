"""A footballer's skeleton in 3D, posed by joint angles, sized to Naga Eleven's 58 px player.

Body frame: x forward, y to his left, z up, the pelvis at the origin. Angles are degrees; a limb's
flex swings it forward from hanging straight down, its out swings it away from the body.
"""

import math

import numpy as np

SOLE_TO_ANKLE = 3
SHIN = 12
THIGH = 12
SPINE = 17
NECK_TO_HEAD = 6
HEAD_RADIUS = 6.8
HIP_HALF = 3.5
SHOULDER_HALF = 6.5
SHOULDER_DROP = 1.5
UPPER_ARM = 8
FOREARM = 7.5
FOOT = 5

NEUTRAL = {
    'air': 0, 'fwd': 0, 'side': 0, 'pitch': 0, 'roll': 0, 'yaw': 0,
    'lean': 0, 'twist': 0, 'bend': 0, 'nod': 0, 'turn': 0,
    'l_hip': 0, 'l_knee': 0, 'l_leg_out': 2, 'l_ankle': 0,
    'r_hip': 0, 'r_knee': 0, 'r_leg_out': 2, 'r_ankle': 0,
    'l_shoulder': 0, 'l_arm_out': 10, 'l_elbow': 15,
    'r_shoulder': 0, 'r_arm_out': 10, 'r_elbow': 15,
    'ball': None,
}

SIDES = (('l', 1), ('r', -1))


def rx(degrees):
    c, s = math.cos(math.radians(degrees)), math.sin(math.radians(degrees))
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def ry(degrees):
    c, s = math.cos(math.radians(degrees)), math.sin(math.radians(degrees))
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def rz(degrees):
    c, s = math.cos(math.radians(degrees)), math.sin(math.radians(degrees))
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])


def swing(flex):
    radians = math.radians(flex)

    return np.array([math.sin(radians), 0, -math.cos(radians)])


def leg(pose, side, sign, root):
    frame = root @ rx(sign * pose[f'{side}_leg_out'])
    hip = root @ np.array([0, sign * HIP_HALF, 0])
    shin_flex = pose[f'{side}_hip'] - pose[f'{side}_knee']
    knee = hip + frame @ swing(pose[f'{side}_hip']) * THIGH
    ankle = knee + frame @ swing(shin_flex) * SHIN
    heel = ankle + frame @ swing(shin_flex) * SOLE_TO_ANKLE
    toe = heel + frame @ swing(shin_flex + 90 - pose[f'{side}_ankle']) * FOOT

    return {f'{side}_hip': hip, f'{side}_knee': knee, f'{side}_ankle': ankle,
            f'{side}_heel': heel, f'{side}_toe': toe}


def arm(pose, side, sign, torso, neck):
    frame = torso @ rx(sign * pose[f'{side}_arm_out'])
    shoulder = neck + torso @ np.array([0, sign * SHOULDER_HALF, -SHOULDER_DROP])
    elbow = shoulder + frame @ swing(pose[f'{side}_shoulder']) * UPPER_ARM
    hand = elbow + frame @ swing(pose[f'{side}_shoulder'] + pose[f'{side}_elbow']) * FOREARM

    return {f'{side}_shoulder': shoulder, f'{side}_elbow': elbow, f'{side}_hand': hand}


def body_points(pose):
    """Every joint in the body frame, and the head's forward and left for its face."""
    pose = {**NEUTRAL, **pose}
    root = rz(pose['yaw']) @ ry(pose['pitch']) @ rx(pose['roll'])
    torso = root @ rz(pose['twist']) @ ry(pose['lean']) @ rx(pose['bend'])
    head = torso @ rz(pose['turn']) @ ry(pose['nod'])
    neck = torso @ np.array([0, 0, SPINE])
    points = {'pelvis': np.zeros(3), 'neck': neck, 'head': neck + head @ np.array([0, 0, NECK_TO_HEAD])}

    for side, sign in SIDES:
        points.update(leg(pose, side, sign, root))
        points.update(arm(pose, side, sign, torso, neck))

    return points, head @ np.array([1, 0, 0]), head @ np.array([0, 1, 0])
