from animations.common import DRAWN

SLIDE = {
    'name': 'slide',
    'fps': 12,
    'loop': False,
    'directions': DRAWN,
    'frames': [
        {'pitch': -25, 'air': 4, 'lean': 12, 'nod': 8, 'roll': -6,
         'r_hip': 55, 'r_knee': 10, 'r_ankle': -5,
         'l_hip': 40, 'l_knee': 100, 'l_ankle': 20, 'l_leg_out': 40,
         'l_shoulder': -30, 'l_arm_out': 40, 'l_elbow': 20,
         'r_shoulder': 40, 'r_arm_out': 60, 'r_elbow': 30},
        {'pitch': -55, 'roll': -10, 'lean': 30, 'nod': 18,
         'r_hip': 35, 'r_knee': 0, 'r_ankle': -10,
         'l_hip': 70, 'l_knee': 100, 'l_ankle': 30, 'l_leg_out': 70,
         'l_shoulder': -40, 'l_arm_out': 30, 'l_elbow': 5,
         'r_shoulder': 50, 'r_arm_out': 70, 'r_elbow': 30},
        {'pitch': -50, 'roll': -10, 'lean': 38, 'nod': 14, 'fwd': 3,
         'r_hip': 52, 'r_knee': 22, 'r_ankle': 15,
         'l_hip': 70, 'l_knee': 100, 'l_ankle': 30, 'l_leg_out': 70,
         'l_shoulder': -35, 'l_arm_out': 35, 'l_elbow': 15,
         'r_shoulder': 35, 'r_arm_out': 60, 'r_elbow': 40},
    ],
    'describe': 'a sliding tackle: he drops onto his left hip and slides feet first, the right leg '
                'straight out along the grass, the left leg folded under him',
    'beats': ['drops, right leg shooting forward', 'full slide on the grass, left hand behind him',
              'right foot hooks up through the ball'],
}
