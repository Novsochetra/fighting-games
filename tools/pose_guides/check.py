"""Checks every guide frame sits in the game's frame: soles on the feet line unless he is in the air,
the head inside the top edge, nothing past the sides, a standing player centred on the anchor.

    python3 tools/pose_guides/check.py
"""

import sys

from animations import ANIMATIONS
from stage import ANCHOR, FRAME, HEAD_RADIUS, project, staged

CENTRED = ('idle', 'run', 'kick', 'throw', 'celebrate')


def problems_of(animation, direction, index, pose):
    frame, anchor = animation.get('frame', FRAME), animation.get('anchor', ANCHOR)
    world, _, _ = staged(pose, direction, frame, anchor)
    drawn = {name: project(point, anchor) for name, point in world.items() if name != 'ball'}
    lowest = max(y for name, (x, y) in drawn.items() if name != 'head')
    top = drawn['head'][1] - HEAD_RADIUS
    xs = [x for x, _ in drawn.values()]
    found = []

    if not pose.get('air') and abs(lowest - anchor[1]) > 0.05:
        found.append(f'lowest point at y={lowest:.1f}, not on the feet line y={anchor[1]}')

    if top < 0:
        found.append(f'head cut off at the top ({top:.1f})')

    if min(xs) < 0 or max(xs) > frame[0]:
        found.append('past a side edge')

    if animation['name'] in CENTRED and abs(drawn['pelvis'][0] - anchor[0]) > 4:
        found.append(f"hips at x={drawn['pelvis'][0]:.1f}, off the anchor x={anchor[0]}")

    return [f"{animation['name']} {direction} frame {index + 1}: {problem}" for problem in found]


def main():
    found = [problem for animation in ANIMATIONS for direction in animation['directions']
             for index, pose in enumerate(animation['frames'])
             for problem in problems_of(animation, direction, index, pose)]
    print('\n'.join(found) or 'every frame sits in the game frame')

    return 1 if found else 0


if __name__ == '__main__':
    sys.exit(main())
