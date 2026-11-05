DRAWN = ['south', 'south-east', 'east', 'north-east', 'north']


def mirrored(pose):
    """The same pose with his left and right swapped."""
    swapped = {}

    for key, value in pose.items():
        if key[:2] in ('l_', 'r_'):
            other = ('r_' if key[0] == 'l' else 'l_') + key[2:]
            swapped[other] = value
        else:
            swapped[key] = value

    for key in ('twist', 'bend', 'roll', 'yaw', 'turn', 'side'):
        if key in swapped:
            swapped[key] = -swapped[key]

    if swapped.get('ball'):
        ball = list(swapped['ball'])
        ball[1] = -ball[1]
        swapped['ball'] = tuple(ball)

    return swapped
