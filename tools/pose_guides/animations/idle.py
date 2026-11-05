from animations.common import DRAWN

STANCE = {
    'lean': 7, 'nod': -4,
    'l_leg_out': 9, 'r_leg_out': 9, 'l_hip': 12, 'r_hip': 6, 'l_knee': 20, 'r_knee': 14,
    'l_shoulder': 8, 'r_shoulder': 4, 'l_arm_out': 16, 'r_arm_out': 16,
    'l_elbow': 35, 'r_elbow': 35,
}


def breath(sink, arms):
    return {**STANCE, 'l_knee': STANCE['l_knee'] + sink, 'r_knee': STANCE['r_knee'] + sink,
            'l_hip': STANCE['l_hip'] + sink / 2, 'r_hip': STANCE['r_hip'] + sink / 2,
            'lean': STANCE['lean'] + sink / 4,
            'l_arm_out': STANCE['l_arm_out'] + arms, 'r_arm_out': STANCE['r_arm_out'] + arms}


IDLE = {
    'name': 'idle',
    'fps': 6,
    'loop': True,
    'directions': DRAWN,
    'frames': [breath(0, 0), breath(4, 2), breath(8, 3), breath(4, 2)],
    'describe': 'a ready stance on the balls of his feet, knees soft, breathing: he sinks a little '
                'and rises back',
    'beats': ['up', 'sinking', 'lowest', 'rising'],
}
