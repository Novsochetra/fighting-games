"""Shrink the Hive Swarm's ChatGPT wasp into its strip of four 56x48 frames."""

import numpy as np

from cut_poses import cut
from lay_out import shrink
from pixel_art import finished

WIDTH, HEIGHT = 56, 48
COLORS = 16
SCALE = 0.083
# where its body sits in every frame, as the old wasp's did, round the strip's anchor
BODY_Y, BODY_X = 25, 28


def body_of(small):
    # its dark body, not its pale wings, holds still while the wings beat
    return small['alpha'] & (small['rgb'].astype(int).sum(axis=2) < 260)


def placed(small):
    ys, xs = np.nonzero(body_of(small))
    top, left = round(BODY_Y - ys.mean()), round(BODY_X - xs.mean())
    rgb = np.zeros((HEIGHT, WIDTH, 3), np.uint8)
    alpha = np.zeros((HEIGHT, WIDTH), bool)
    for row, column in zip(*np.nonzero(small['alpha'])):
        if 0 <= top + row < HEIGHT and 0 <= left + column < WIDTH:
            alpha[top + row, left + column] = True
            rgb[top + row, left + column] = small['rgb'][row, column]
    return rgb, alpha


def wasp_strip(source):
    frames = [placed(shrink(pose, SCALE)) for pose in cut(f'{source}/wasp.webp', 2, 2)]
    done, rgb_palette = finished(frames, COLORS, glow_outlined=True)
    strip = np.zeros((HEIGHT, WIDTH * len(done), 4), np.uint8)
    for index, (indices, alpha) in enumerate(done):
        strip[:, WIDTH * index:WIDTH * (index + 1), :3] = rgb_palette[indices]
        strip[:, WIDTH * index:WIDTH * (index + 1), 3] = alpha * 255
    return strip, done
