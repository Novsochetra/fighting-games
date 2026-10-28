"""Cut the poses of a ChatGPT grid image off its flat cyan background, in reading order."""

from collections import deque

import numpy as np
from PIL import Image

POOL = 4
CYAN_KEY = 90


def load(path):
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.int16)
    cyan = np.minimum(rgb[..., 1], rgb[..., 2]) - rgb[..., 0]
    return rgb.astype(np.uint8), cyan < CYAN_KEY


def pooled(mask, grow):
    height, width = mask.shape[0] // POOL, mask.shape[1] // POOL
    small = mask[:height * POOL, :width * POOL].reshape(height, POOL, width, POOL).any(axis=(1, 3))
    for _ in range(grow):
        grown = small.copy()
        grown[1:] |= small[:-1]
        grown[:-1] |= small[1:]
        grown[:, 1:] |= small[:, :-1]
        grown[:, :-1] |= small[:, 1:]
        small = grown
    return small


def label(small):
    labels = np.zeros(small.shape, np.int32)
    count = 0
    for start in zip(*np.nonzero(small)):
        if labels[start]:
            continue
        count += 1
        labels[start] = count
        queue = deque([start])
        while queue:
            y, x = queue.popleft()
            for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                inside = 0 <= ny < small.shape[0] and 0 <= nx < small.shape[1]
                if inside and small[ny, nx] and not labels[ny, nx]:
                    labels[ny, nx] = count
                    queue.append((ny, nx))
    return labels, count


def cells_of(ys, xs, grid):
    columns, cell_height, cell_width = grid
    return (ys // cell_height).astype(int) * columns + (xs // cell_width).astype(int)


def cell_at_middle(ys, xs, grid):
    return cells_of(np.array([ys.mean()]), np.array([xs.mean()]), grid)[0]


def owners(labels, count, grid, tight):
    # two poses drawn close are one piece once grown; such a piece is cut again ungrown
    owner_map = np.full(labels.shape, -1, np.int32)
    for component in range(1, count + 1):
        piece = labels == component
        ys, xs = np.nonzero(piece)
        if len(ys) < 3:
            continue
        cells = cells_of(ys, xs, grid)
        if np.bincount(cells).max() / len(cells) > 0.97:
            owner_map[ys, xs] = cell_at_middle(ys, xs, grid)
            continue
        parts, part_count = label(tight & piece)
        for part in range(1, part_count + 1):
            part_ys, part_xs = np.nonzero(parts == part)
            owner_map[part_ys, part_xs] = cell_at_middle(part_ys, part_xs, grid)
        owner_map[piece & (owner_map < 0)] = np.bincount(owner_map[piece & (owner_map >= 0)]).argmax()
    return owner_map


def cut(path, columns, rows, grow=3):
    rgb, mask = load(path)
    labels, count = label(pooled(mask, grow))
    grid = (columns, labels.shape[0] / rows, labels.shape[1] / columns)
    owner_map = owners(labels, count, grid, pooled(mask, 0))
    full = np.kron(owner_map, np.ones((POOL, POOL), np.int32))
    full = np.pad(full, ((0, mask.shape[0] - full.shape[0]), (0, mask.shape[1] - full.shape[1])),
                  constant_values=-1)
    poses = []
    for cell in range(columns * rows):
        pose_mask = mask & (full == cell)
        ys, xs = np.nonzero(pose_mask)
        if not len(ys):
            continue
        top, bottom, left, right = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        poses.append({
            'rgb': rgb[top:bottom, left:right],
            'mask': pose_mask[top:bottom, left:right],
            'left': int(left),
            'top': int(top),
            'cell': (cell % columns, cell // columns),
            'cell_size': (mask.shape[1] / columns, mask.shape[0] / rows),
        })
    return poses
