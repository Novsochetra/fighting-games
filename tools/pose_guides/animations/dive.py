def flying(pitch, air, fwd, arms=168, elbow=10, knees=(15, 35), ankle=35, nod=-25):
    return {'pitch': pitch, 'air': air, 'fwd': fwd, 'nod': nod,
            'l_hip': -4, 'l_knee': knees[0], 'l_ankle': ankle,
            'r_hip': 6, 'r_knee': knees[1], 'r_ankle': ankle,
            'l_shoulder': arms, 'l_arm_out': 14, 'l_elbow': elbow,
            'r_shoulder': arms, 'r_arm_out': 14, 'r_elbow': elbow}


DIVE = {
    'name': 'dive',
    'fps': 14,
    'loop': False,
    'directions': ['east'],
    'frames': [
        {'lean': 18, 'fwd': -8, 'nod': -12,
         'l_hip': 28, 'r_hip': 28, 'l_knee': 40, 'r_knee': 40, 'l_leg_out': 14, 'r_leg_out': 14,
         'l_shoulder': 55, 'r_shoulder': 55, 'l_arm_out': 30, 'r_arm_out': 30,
         'l_elbow': 45, 'r_elbow': 45},
        {'lean': 32, 'fwd': -8, 'nod': -20,
         'l_hip': 50, 'r_hip': 40, 'l_knee': 72, 'r_knee': 62, 'l_leg_out': 10, 'r_leg_out': 10,
         'l_shoulder': 10, 'r_shoulder': 10, 'l_arm_out': 25, 'r_arm_out': 25,
         'l_elbow': 40, 'r_elbow': 40},
        {'pitch': 35, 'air': 1, 'fwd': -6, 'nod': -25,
         'l_hip': -22, 'l_knee': 10, 'l_ankle': 45, 'r_hip': 55, 'r_knee': 85, 'r_ankle': 20,
         'l_shoulder': 140, 'r_shoulder': 140, 'l_arm_out': 15, 'r_arm_out': 15,
         'l_elbow': 10, 'r_elbow': 10},
        flying(66, 6, -3, elbow=20, knees=(25, 50)),
        flying(82, 8, 0, elbow=25, knees=(35, 60)),
        flying(90, 3, 2, arms=160, elbow=30, knees=(45, 70), nod=-30),
        flying(92, 0, 3, arms=150, elbow=45, knees=(45, 65), nod=-35),
        flying(92, 0, 4, arms=125, elbow=80, knees=(55, 75), nod=-40),
    ],
    'describe': "the keeper's dive, seen from the side: set, load, spring off his left foot, fly "
                'flat with both gloves stretched out, land on his chest and gather the ball in',
    'beats': ['set, gloves ready', 'loads, deep crouch', 'springs off the left foot',
              'rising, arms reaching', 'full stretch, flat in the air', 'coming down',
              'lands on his chest, gloves on the grass', 'gathers in, knees drawn'],
}
