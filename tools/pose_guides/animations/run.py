from animations.common import DRAWN

# his right leg through one stride; his left is the same three frames later
RIGHT_LEG = [
    {'hip': 32, 'knee': 16, 'ankle': -5},
    {'hip': 8, 'knee': 40, 'ankle': 5},
    {'hip': -22, 'knee': 24, 'ankle': 40},
    {'hip': -34, 'knee': 75, 'ankle': 45},
    {'hip': 10, 'knee': 112, 'ankle': 30},
    {'hip': 45, 'knee': 70, 'ankle': 10},
]
AIRBORNE = [0, 0, 0.3, 0, 0, 0.3]


def stride(frame):
    right, left = RIGHT_LEG[frame], RIGHT_LEG[(frame + 3) % 6]
    swing = right['hip'] - left['hip']

    return {
        'air': AIRBORNE[frame], 'lean': 11, 'nod': -8, 'twist': -swing * 0.12,
        'r_hip': right['hip'], 'r_knee': right['knee'], 'r_ankle': right['ankle'],
        'l_hip': left['hip'], 'l_knee': left['knee'], 'l_ankle': left['ankle'],
        'r_shoulder': -swing * 0.55, 'l_shoulder': swing * 0.55,
        'r_elbow': 85 + max(0, swing) * 0.3, 'l_elbow': 85 + max(0, -swing) * 0.3,
        'l_arm_out': 12, 'r_arm_out': 12, 'l_leg_out': 3, 'r_leg_out': 3,
    }


RUN = {
    'name': 'run',
    'fps': 12,
    'loop': True,
    'directions': DRAWN,
    'frames': [stride(frame) for frame in range(6)],
    'describe': 'a sprint: leaning forward, arms pumping at a right angle opposite the legs, both '
                'feet off the grass on frames 3 and 6',
    'beats': ['right foot lands', 'right leg takes weight', 'right foot pushes off, flight',
              'left foot lands', 'left leg takes weight', 'left foot pushes off, flight'],
}
