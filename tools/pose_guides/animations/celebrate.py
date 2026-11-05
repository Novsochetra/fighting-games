def standing(knees=0, hips=0, lean=0, air=0, arm_out=15, shoulder=5, elbow=30, nod=0, ankle=0):
    return {'air': air, 'lean': lean, 'nod': nod,
            'l_hip': hips, 'r_hip': hips, 'l_knee': knees, 'r_knee': knees,
            'l_ankle': ankle, 'r_ankle': ankle, 'l_leg_out': 6, 'r_leg_out': 6,
            'l_shoulder': shoulder, 'r_shoulder': shoulder,
            'l_arm_out': arm_out, 'r_arm_out': arm_out, 'l_elbow': elbow, 'r_elbow': elbow}


CELEBRATE = {
    'name': 'celebrate',
    'fps': 10,
    'loop': True,
    'directions': ['south'],
    'frames': [
        standing(elbow=40),
        standing(knees=55, hips=40, lean=22, shoulder=-25, arm_out=25, elbow=70),
        standing(knees=15, hips=8, shoulder=30, arm_out=55, elbow=115, nod=-10),
        standing(air=1, knees=40, hips=5, ankle=40, arm_out=125, shoulder=10, elbow=35, nod=-18),
        standing(air=2, knees=80, hips=35, ankle=30, arm_out=130, shoulder=10, elbow=30, nod=-20),
        standing(air=0.5, knees=30, hips=5, ankle=35, arm_out=120, shoulder=10, elbow=40, nod=-15),
        standing(knees=40, hips=30, lean=12, arm_out=70, shoulder=15, elbow=115),
        standing(lean=-8, arm_out=80, shoulder=10, elbow=125, nod=-14),
    ],
    'describe': 'a goal celebration facing the camera: he crouches, springs up with both arms '
                'thrown up in a V, lands and pumps both fists, shouting',
    'beats': ['stands, fists clenched', 'crouches to jump', 'rising, fists by his face',
              'off the ground, arms up', 'top of the jump, knees tucked', 'coming down, arms up',
              'lands, fists pumped', 'chest out, roaring'],
}
