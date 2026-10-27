"""Shrink the Scorpion Queen's ChatGPT poses to her stance and stand them in her sheet's frames."""

import numpy as np
from PIL import Image

from cut_poses import cut

FRAME_WIDTH, FRAME_HEIGHT = 256, 160
# the outline adds the row under her feet, so it lands on the sheet's feet line, y = 156
GROUND = 155
# her old idle frame's middle, so her body stays where her hurt box and reaches were measured
CENTER_X = 142
STANCE = 86

# strip, grid, the stance poses (1-based) its size is measured on, and how each pose is lined up:
# 'rear' by her planted rear legs, 'all' by her whole body, 'cell:n' where ChatGPT drew it in its
# cell beside pose n, for poses with no planted legs (thrown, lying, dug in, bursting out)
STRIPS = [
    ('idle', (2, 2), [1], {'all': 'rear'}),
    ('walk', (4, 2), [1, 2, 3, 4, 5, 6, 7, 8], {'all': 'all'}),
    ('attack', (3, 3), [1, 7, 8, 9], {'all': 'rear'}),
    ('hurt', (2, 2), [3, 4], {'all': 'rear'}),
    ('ko', (3, 3), [1], {1: 'rear', 'all': 'cell:1'}),
    ('slam', (3, 3), [1, 9], {'all': 'rear'}),
    ('charge', (4, 2), None, {'all': 'all'}),
    ('burrow', (4, 3), [1], {1: 'rear', 'all': 'cell:1'}),
    ('emerge', (4, 2), [7, 8], {8: 'rear', 'all': 'cell:8'}),
    ('tail_sting', (3, 3), [1, 9], {'all': 'rear'}),
    ('hive_swarm', (4, 3), [1, 11, 12], {'all': 'rear'}),
]
# the charge has no stance to measure: it is drawn on the walk's grid, at the walk's size
SCALE_LIKE = {'charge': 'walk'}
# ChatGPT kept her strikes close to her body, short of the reach her blows have in the game, so
# the striking limb is drawn out on the frames the blow is out: a lunge in sheet pixels, and bands
# of the source pose ([first row, last row), from x, to x, sheet pixels added) stretched between
# their two x and carried along past the second
REACH = {
    ('attack', 4): (14, [((136, 196), 245, 330, 24)]),
    ('attack', 5): (7, [((136, 196), 245, 330, 12)]),
    ('tail_sting', 5): (8, [((0, 60), 150, 238, 28), ((60, 185), 238, 238, 28)]),
    ('tail_sting', 6): (8, [((0, 55), 150, 255, 34), ((55, 148), 255, 255, 34)]),
}


def reached(pose, bands, scale):
    rgb, mask = pose['rgb'], pose['mask']
    widest = max(round(shift / scale) for _, _, _, shift in bands)
    width = mask.shape[1]
    rgb = np.pad(rgb, ((0, 0), (0, widest), (0, 0)))
    mask = np.pad(mask, ((0, 0), (0, widest)))
    columns = np.arange(width + widest, dtype=np.float64)
    for (first, last), start, end, shift in bands:
        source_shift = shift / scale
        moved = columns + np.clip((columns - start) / max(1, end - start), 0, 1) * source_shift
        if end == start:
            moved = columns + (columns > start) * source_shift
        source = np.clip(np.round(np.interp(columns, moved, columns)).astype(int), 0, width + widest - 1)
        rgb[first:last] = rgb[first:last][:, source]
        mask[first:last] = mask[first:last][:, source]
        if end == start:
            # a block carried along leaves a gap, not its edge column drawn out across it
            mask[first:last, start + 1:round(start + source_shift) + 1] = False
    return {**pose, 'rgb': rgb, 'mask': mask}


def eroded(mask, steps):
    for _ in range(steps):
        shrunk = mask.copy()
        shrunk[1:] &= mask[:-1]
        shrunk[:-1] &= mask[1:]
        shrunk[:, 1:] &= mask[:, :-1]
        shrunk[:, :-1] &= mask[:, 1:]
        mask = shrunk
    return mask


def bled(rgb, mask, steps):
    # the colors at the edge are carried out over the background, so no cyan is averaged in
    rgb, known = rgb.astype(np.float32).copy(), mask.copy()
    for _ in range(steps):
        total = np.zeros_like(rgb)
        count = np.zeros(mask.shape, np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            shifted_known = np.roll(known, (dy, dx), axis=(0, 1))
            total += np.roll(rgb, (dy, dx), axis=(0, 1)) * shifted_known[..., None]
            count += shifted_known
        fill = ~known & (count > 0)
        rgb[fill] = total[fill] / count[fill][:, None]
        known = known | fill
    return rgb


def shrink(pose, scale):
    height, width = pose['mask'].shape
    pad = 8
    mask = np.pad(pose['mask'], pad)
    rgb = np.pad(pose['rgb'], ((pad, pad), (pad, pad), (0, 0)))
    color = bled(rgb, eroded(mask, 2), 10)
    size = (max(1, round((width + 2 * pad) * scale)), max(1, round((height + 2 * pad) * scale)))
    small_rgb = Image.fromarray(np.clip(color, 0, 255).astype(np.uint8)).resize(size, Image.BOX)
    coverage = Image.fromarray((mask * 255).astype(np.uint8)).resize(size, Image.BOX)
    return {
        'rgb': np.asarray(small_rgb),
        'alpha': np.asarray(coverage) >= 128,
        'left': (pose['left'] - pad) * scale,
        'cell_left': pose['cell'][0] * pose['cell_size'][0] * scale,
    }


def bounds(alpha):
    ys, xs = np.nonzero(alpha)
    return ys.min(), ys.max() + 1, xs.min(), xs.max() + 1


def region(alpha, kind, reference_box):
    if kind == 'all':
        return alpha
    top, bottom, left, right = reference_box
    kept = np.zeros_like(alpha)
    kept[bottom - (bottom - top) * 35 // 100:bottom, left:left + (right - left) // 2] = True
    return alpha & kept


def frame_of(small, x, y):
    frame_rgb = np.zeros((FRAME_HEIGHT, FRAME_WIDTH, 3), np.uint8)
    frame_alpha = np.zeros((FRAME_HEIGHT, FRAME_WIDTH), bool)
    height, width = small['alpha'].shape
    for row in range(height):
        if not 0 <= y + row < FRAME_HEIGHT:
            continue
        target = slice(max(0, x), min(FRAME_WIDTH, x + width))
        source = slice(target.start - x, target.stop - x)
        frame_alpha[y + row, target] = small['alpha'][row, source]
        frame_rgb[y + row, target] = small['rgb'][row, source]
    return frame_rgb, frame_alpha


def grounded_y(small):
    _, bottom, _, _ = bounds(small['alpha'])
    return GROUND - bottom


def registered_x(small, reference_alpha, kind):
    reference_box = bounds(reference_alpha)
    target = region(reference_alpha, kind, reference_box)
    y = grounded_y(small)
    _, _, left, right = bounds(small['alpha'])
    start = CENTER_X - (left + right) // 2
    best = None
    for x in range(start - 40, start + 41):
        placed = region(frame_of(small, x, y)[1], kind, reference_box)
        overlap = np.count_nonzero(placed & target) / max(1, np.count_nonzero(placed | target))
        if best is None or overlap > best[0]:
            best = (overlap, x)
    return best[1]


def strip_scale(source, name, grid, stance):
    poses = cut(f'{source}/queen_{name}.webp', *grid)
    return STANCE / float(np.median([poses[number - 1]['mask'].shape[0] for number in stance]))


def drawn_out(name, poses, scale):
    lunges = {}
    for number, pose in enumerate(poses, 1):
        if (name, number) in REACH:
            lunges[number], bands = REACH[(name, number)]
            poses[number - 1] = reached(pose, bands, scale)
    return lunges


def lay_out(source, name, grid, scale, rules, reference_alpha):
    cut_poses = cut(f'{source}/queen_{name}.webp', *grid)
    lunges = drawn_out(name, cut_poses, scale)
    poses = [shrink(pose, scale) for pose in cut_poses]
    rule_of = {number: rules.get(number, rules['all']) for number in range(1, len(poses) + 1)}
    placed = {
        number: (registered_x(small, reference_alpha, rule_of[number]), grounded_y(small))
        for number, small in enumerate(poses, 1)
        if not rule_of[number].startswith('cell')
    }
    for number, small in enumerate(poses, 1):
        if rule_of[number].startswith('cell'):
            anchor = poses[int(rule_of[number].split(':')[1]) - 1]
            anchor_x, _ = placed[int(rule_of[number].split(':')[1])]
            within = (small['left'] - small['cell_left']) - (anchor['left'] - anchor['cell_left'])
            placed[number] = (round(anchor_x + within), grounded_y(small))
    for number, lunge in lunges.items():
        placed[number] = (placed[number][0] + lunge, placed[number][1])
    return [frame_of(small, *placed[number]) for number, small in enumerate(poses, 1)]


def laid_out_rows(source):
    scales = {name: strip_scale(source, name, grid, stance)
              for name, grid, stance, _ in STRIPS if stance}
    for name, like in SCALE_LIKE.items():
        scales[name] = scales[like]
    stance = shrink(cut(f'{source}/queen_idle.webp', 2, 2)[0], scales['idle'])
    _, _, left, right = bounds(stance['alpha'])
    reference_alpha = frame_of(stance, CENTER_X - (left + right) // 2, grounded_y(stance))[1]
    return [lay_out(source, name, grid, scales[name], rules, reference_alpha)
            for name, grid, _, rules in STRIPS]
