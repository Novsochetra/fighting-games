"""The hero's body as shapes in his own frame: u to his right, v forward, z up, soles on z 0.

Each part is (name, material, blend, distance): parts sharing a blend are melted together, so a
shoulder runs into its arm; the part nearest a surface point gives that pixel its material.
"""

from functools import partial

from sdf import clipped, cone, ellipsoid, round_box, turned
SHOULDER, ELBOW, WRIST, FIST = (12.6, -0.4, 63.4), (18.4, -1.2, 54), (20.4, 1, 45.6), (20.8, 1.6, 40.4)
SHOULDER, ELBOW, WRIST, FIST = (12.6, -0.4, 63.4), (17.4, -1.2, 53.8), (19.4, 1, 45.4), (20, 1.6, 40.4)
HIP, KNEE, ANKLE = (6.8, 0, 42), (11.8, 0.6, 26.5), (15, -0.6, 9.5)


def mirrored(side, point):
    return (side * point[0], point[1], point[2])


def head_parts():
    return [
        ('cranium', 'skin', 'head', partial(ellipsoid, centre=(0, -0.6, 80.6), radii=(10.2, 10.2, 10.6))),
        ('jaw', 'skin', 'head', partial(ellipsoid, centre=(0, 1.8, 74.6), radii=(7.9, 7.9, 5.8))),
        ('chin', 'skin', 'head', partial(ellipsoid, centre=(0, 4.4, 71.4), radii=(4.2, 4, 2.6))),
        ('nose', 'skin', 'nose', partial(ellipsoid, centre=(0, 9.9, 75.8), radii=(1.2, 1.4, 2.2))),
        ('nape', 'skin', 'head', partial(ellipsoid, centre=(0, -4, 72.5), radii=(5.4, 4, 5.4))),
        ('neck', 'skin', 'head', partial(cone, start=(0, -1, 64), end=(0, 0, 73), start_radius=4.9, end_radius=4.3)),
    ]


def ear_parts(side):
    return [(f'ear{side}', 'skin', 'ear', partial(ellipsoid, centre=mirrored(side, (9.9, -1, 77)), radii=(1.6, 2.3, 3.2)))]


def torso_parts():
    return [
        ('chest', 'shirt', 'torso', partial(ellipsoid, centre=(0, 0.2, 59), radii=(12, 9.6, 9.6))),
        ('belly', 'shirt', 'torso', partial(ellipsoid, centre=(0, 0, 49.4), radii=(11.2, 9, 8.4))),
        ('blades', 'shirt', 'torso', partial(ellipsoid, centre=(0, -5.2, 57.5), radii=(10, 4.6, 6))),
        ('collar', 'shirt', 'torso', clipped(partial(cone, start=(0, -0.6, 63), end=(0, -0.6, 67.2), start_radius=6.8,
                                                     end_radius=5.4), above=66.4)),
    ]


def arm_parts(side):
    return [
        (f'sleeve{side}', 'shirt', 'torso', clipped(partial(cone, start=mirrored(side, (12.2, -0.3, 63.2)),
                                                            end=mirrored(side, ELBOW), start_radius=5.6, end_radius=4.9),
                                                    below=56.4)),
        (f'upper{side}', 'skin', f'arm{side}', partial(cone, start=mirrored(side, SHOULDER), end=mirrored(side, ELBOW),
                                                       start_radius=4.5, end_radius=3.9)),
        (f'fore{side}', 'skin', f'arm{side}', partial(cone, start=mirrored(side, ELBOW), end=mirrored(side, WRIST),
                                                      start_radius=4.2, end_radius=3.2)),
        (f'fist{side}', 'skin', f'arm{side}', partial(round_box, centre=mirrored(side, FIST), half=(4.1, 4.5, 4.5),
                                                      radius=3)),
    ]


def leg_parts(side):
    return [
        (f'thigh{side}', 'skin', f'leg{side}', partial(cone, start=mirrored(side, HIP), end=mirrored(side, KNEE),
                                                       start_radius=6.4, end_radius=5)),
        (f'shin{side}', 'skin', f'leg{side}', partial(cone, start=mirrored(side, KNEE), end=mirrored(side, ANKLE),
                                                      start_radius=4.8, end_radius=3.6)),
        (f'calf{side}', 'skin', f'leg{side}', partial(ellipsoid, centre=mirrored(side, (13.2, -2.6, 19.5)), radii=(4.8, 5, 6.4))),
        (f'boot{side}', 'boots', f'boot{side}', turned(clipped(partial(ellipsoid, centre=mirrored(side, (15.4, 3, 3.2)),
                                                                       radii=(5.4, 9.4, 4.4)), below=0),
                                                       mirrored(side, (15.4, 0, 0)), side * 16)),
        (f'collar{side}', 'boots', f'boot{side}', partial(cone, start=mirrored(side, (15.1, -0.8, 3)),
                                                          end=mirrored(side, (15.1, -0.8, 7.4)), start_radius=4.8, end_radius=4.3)),
    ]


def shorts_parts():
    parts = [('hips', 'shorts', 'shorts', partial(ellipsoid, centre=(0, -0.3, 41.4), radii=(12.6, 7.2, 5.6))),
             ('seat', 'shorts', 'shorts', partial(ellipsoid, centre=(0, -3.4, 39.8), radii=(9.4, 5.4, 4.4)))]

    for side in (1, -1):
        leg = partial(cone, start=mirrored(side, (6.8, -0.2, 41)), end=mirrored(side, (11.6, 0.2, 28)),
                      start_radius=7.4, end_radius=7.2)
        parts.append((f'short{side}', 'shorts', 'shorts', clipped(leg, below=33)))

    return parts


def body_parts():
    parts = head_parts() + torso_parts() + shorts_parts()

    for side in (1, -1):
        parts += ear_parts(side) + arm_parts(side) + leg_parts(side)

    return parts
