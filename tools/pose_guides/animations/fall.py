from animations.common import DRAWN

FALL = {
    'name': 'fall',
    'fps': 7,
    'loop': False,
    'directions': DRAWN,
    'frames': [
        {'pitch': 25, 'air': 2, 'lean': 8, 'nod': -18,
         'l_hip': 22, 'l_knee': 30, 'r_hip': -50, 'r_knee': 70, 'r_ankle': 30,
         'l_shoulder': 60, 'l_arm_out': 55, 'l_elbow': 30,
         'r_shoulder': 95, 'r_arm_out': 40, 'r_elbow': 20},
        {'pitch': 62, 'air': 3, 'nod': -35,
         'l_hip': -10, 'l_knee': 30, 'l_ankle': 30, 'r_hip': -20, 'r_knee': 50, 'r_ankle': 30,
         'l_shoulder': 105, 'l_arm_out': 22, 'l_elbow': 15,
         'r_shoulder': 105, 'r_arm_out': 22, 'r_elbow': 15},
        {'pitch': 86, 'nod': -48,
         'l_hip': 0, 'l_knee': 8, 'l_ankle': 40, 'r_hip': 4, 'r_knee': 20, 'r_ankle': 40,
         'l_leg_out': 8, 'r_leg_out': 8,
         'l_shoulder': 75, 'l_arm_out': 40, 'l_elbow': 75,
         'r_shoulder': 75, 'r_arm_out': 40, 'r_elbow': 75},
        {'lean': 28, 'nod': -10,
         'l_hip': -5, 'l_knee': 95, 'l_ankle': 40, 'r_hip': 80, 'r_knee': 88,
         'l_shoulder': 20, 'l_arm_out': 25, 'l_elbow': 30,
         'r_shoulder': 55, 'r_arm_out': 15, 'r_elbow': 45},
    ],
    'describe': 'tackled: he trips, falls on his front, lands on his hands and pushes back up to '
                'one knee',
    'beats': ['tripped, right leg swept back, arms flung', 'falling forward, hands reaching for '
              'the grass', 'down on his front, head up', 'up on his left knee, right foot planted'],
}
