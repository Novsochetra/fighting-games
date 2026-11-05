from animations.common import DRAWN

KICK = {
    'name': 'kick',
    'fps': 12,
    'loop': False,
    'directions': DRAWN,
    'frames': [
        {'lean': 4, 'twist': -16, 'nod': 8,
         'l_hip': 18, 'l_knee': 28, 'l_leg_out': 6,
         'r_hip': -42, 'r_knee': 105, 'r_ankle': 45,
         'l_shoulder': 35, 'l_arm_out': 60, 'l_elbow': 25,
         'r_shoulder': -35, 'r_arm_out': 45, 'r_elbow': 30, 'ball': (8, -3)},
        {'lean': -4, 'twist': 6, 'nod': 12,
         'l_hip': 10, 'l_knee': 18, 'l_leg_out': 6,
         'r_hip': 30, 'r_knee': 12, 'r_ankle': 35,
         'l_shoulder': 15, 'l_arm_out': 80, 'l_elbow': 15,
         'r_shoulder': -25, 'r_arm_out': 55, 'r_elbow': 25, 'ball': (11, -3)},
        {'lean': -14, 'twist': 18, 'nod': 4, 'air': 0.5,
         'l_hip': 0, 'l_knee': 8, 'l_ankle': 25, 'l_leg_out': 4,
         'r_hip': 85, 'r_knee': 15, 'r_ankle': 30,
         'l_shoulder': 40, 'l_arm_out': 40, 'l_elbow': 30,
         'r_shoulder': -45, 'r_arm_out': 40, 'r_elbow': 25, 'ball': (15, -2, 11)},
        {'lean': 6, 'twist': 6,
         'l_hip': 12, 'l_knee': 25,
         'r_hip': 30, 'r_knee': 60, 'r_ankle': 15,
         'l_shoulder': 15, 'l_arm_out': 35, 'l_elbow': 30,
         'r_shoulder': -10, 'r_arm_out': 30, 'r_elbow': 30},
    ],
    'describe': 'a shot with the right foot: the left foot planted beside the ball, the right leg '
                'swings through, the left arm out wide for balance',
    'beats': ['left foot plants, right leg cocked back', 'right instep meets the ball',
              'follow-through, right leg high, up on the left toe', 'right foot comes down'],
}
