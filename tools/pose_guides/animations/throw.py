from animations.common import DRAWN

THROW = {
    'name': 'throw',
    'fps': 1,
    'loop': False,
    'directions': DRAWN,
    'frame': (64, 74),
    'anchor': (32, 73),
    'frames': [
        {'lean': -14, 'nod': -12,
         'l_hip': 18, 'l_knee': 10, 'r_hip': -10, 'r_knee': 12, 'r_ankle': 25,
         'l_shoulder': 165, 'r_shoulder': 165, 'l_arm_out': -40, 'r_arm_out': -40,
         'l_elbow': 105, 'r_elbow': 105, 'ball': (-4, 0, 60)},
        {'lean': 20, 'nod': 6,
         'l_hip': 22, 'l_knee': 15, 'r_hip': -18, 'r_knee': 25, 'r_ankle': 40,
         'l_shoulder': 105, 'r_shoulder': 105, 'l_arm_out': 12, 'r_arm_out': 12,
         'l_elbow': 5, 'r_elbow': 5},
    ],
    # an arm raised overhead flares out with a negative out: the out swing turns about his forward
    # axis, which carries a raised arm inward
    'describe': 'a throw-in, both feet on the grass: the ball held behind his head in both hands, '
                'then thrown, arms reaching forward',
    'beats': ['ball behind his head, back arched', 'thrown, arms forward, back toe dragging'],
}
