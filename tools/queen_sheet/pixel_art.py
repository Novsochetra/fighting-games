"""Finish shrunk paintings as pixel art: one small palette, flat clusters and a dark outline."""

from collections import deque

import numpy as np

SPECKLE_DELTA = 16
NEIGHBOURS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def to_lab(rgb):
    linear = rgb / 255.0
    linear = np.where(linear > 0.04045, ((linear + 0.055) / 1.055) ** 2.4, linear / 12.92)
    xyz = linear @ np.array([[0.4124, 0.2126, 0.0193], [0.3576, 0.7152, 0.1192],
                             [0.1805, 0.0722, 0.9505]])
    xyz /= np.array([0.95047, 1.0, 1.08883])
    curve = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * curve[..., 1] - 16, 500 * (curve[..., 0] - curve[..., 1]),
                     200 * (curve[..., 1] - curve[..., 2])], axis=-1)


def kmeans(points, count, rounds=25, seed=7):
    random = np.random.default_rng(seed)
    centers = [points[random.integers(len(points))]]
    for _ in range(count - 1):
        distance = np.min([((points - center) ** 2).sum(axis=1) for center in centers], axis=0)
        centers.append(points[random.choice(len(points), p=distance / distance.sum())])
    centers = np.array(centers)
    for _ in range(rounds):
        nearest = np.argmin(((points[:, None] - centers[None]) ** 2).sum(axis=2), axis=1)
        for index in range(count):
            members = points[nearest == index]
            if len(members):
                centers[index] = members.mean(axis=0)
    return centers


def nearest_index(lab, centers):
    flat = lab.reshape(-1, 3)
    chosen = np.empty(len(flat), np.int32)
    for start in range(0, len(flat), 20000):
        part = flat[start:start + 20000]
        chosen[start:start + 20000] = np.argmin(((part[:, None] - centers[None]) ** 2).sum(axis=2), axis=1)
    return chosen.reshape(lab.shape[:2])


def palette_of(samples, count, seed=3, most=40000):
    picked = samples
    if len(samples) > most:
        picked = samples[np.random.default_rng(seed).choice(len(samples), most, replace=False)]
    lab_palette = kmeans(to_lab(picked), count)
    nearest = nearest_index(to_lab(picked)[None], lab_palette)[0]
    rgb_palette = np.array([picked[nearest == index].mean(axis=0) if (nearest == index).any()
                            else [0, 0, 0] for index in range(count)]).round().astype(np.uint8)
    return lab_palette, rgb_palette


def components(mask):
    labels = np.zeros(mask.shape, np.int32)
    sizes = [0]
    for start in zip(*np.nonzero(mask)):
        if labels[start]:
            continue
        sizes.append(0)
        labels[start] = len(sizes) - 1
        queue = deque([start])
        while queue:
            y, x = queue.popleft()
            sizes[-1] += 1
            for dy, dx in NEIGHBOURS:
                ny, nx = y + dy, x + dx
                inside = 0 <= ny < mask.shape[0] and 0 <= nx < mask.shape[1]
                if inside and mask[ny, nx] and not labels[ny, nx]:
                    labels[ny, nx] = len(sizes) - 1
                    queue.append((ny, nx))
    return labels, sizes


def grown(mask, steps):
    for _ in range(steps):
        wider = mask.copy()
        wider[1:] |= mask[:-1]
        wider[:-1] |= mask[1:]
        wider[:, 1:] |= mask[:, :-1]
        wider[:, :-1] |= mask[:, 1:]
        mask = wider
    return mask


def without_strays(alpha):
    # a crumb of dirt the cut left far from her body is dropped; the clods round her mound stay
    labels, sizes = components(alpha)
    if len(sizes) <= 2:
        return alpha
    body = int(np.argmax(sizes))
    near = grown(labels == body, 10)
    kept = alpha.copy()
    for index, size in enumerate(sizes):
        if index and index != body and size < 6 and not (near & (labels == index)).any():
            kept[labels == index] = False
    return kept


def merge_lone(indices, alpha, lab_palette, rounds=3):
    height, width = indices.shape
    for _ in range(rounds):
        changed = 0
        for y, x in zip(*np.nonzero(alpha)):
            own = indices[y, x]
            around = [indices[y + dy, x + dx] for dy, dx in NEIGHBOURS
                      if 0 <= y + dy < height and 0 <= x + dx < width and alpha[y + dy, x + dx]]
            if not around or own in around:
                continue
            closest = min(around, key=lambda other: ((lab_palette[other] - lab_palette[own]) ** 2).sum())
            if ((lab_palette[closest] - lab_palette[own]) ** 2).sum() < SPECKLE_DELTA ** 2:
                indices[y, x] = closest
                changed += 1
        if not changed:
            break
    return indices


def glowing(lab_palette):
    lightness, green_red, yellow_blue = lab_palette[:, 0], lab_palette[:, 1], lab_palette[:, 2]
    return (green_red < -25) & (yellow_blue > 25) & (lightness > 50)


def outlined(indices, alpha, outline_index, glow):
    # venom glows to its edge, as fire and sparks do on the other bosses: only the body is outlined
    body = alpha & ~glow[indices]
    ring = np.zeros_like(alpha)
    for dy, dx in NEIGHBOURS:
        ring |= np.roll(body, (dy, dx), axis=(0, 1))
    ring &= ~alpha
    indices = indices.copy()
    indices[ring] = outline_index
    return indices, alpha | ring


def speckle(indices, alpha):
    drawn = np.count_nonzero(alpha)
    if drawn <= 30:
        return 0
    lone = np.ones_like(alpha)
    for dy, dx in NEIGHBOURS:
        same = (np.roll(indices, (dy, dx), axis=(0, 1)) == indices) & np.roll(alpha, (dy, dx), axis=(0, 1))
        lone &= ~same
    return np.count_nonzero(lone & alpha) / drawn


def finished(frames, count, glow_outlined=False):
    samples = np.concatenate([rgb[alpha] for rgb, alpha in frames]).astype(np.float64)
    lab_palette, rgb_palette = palette_of(samples, count)
    darkest = int(np.argmin(lab_palette[:, 0]))
    glow = np.zeros(count, bool) if glow_outlined else glowing(lab_palette)
    done = []
    for rgb, alpha in frames:
        indices = nearest_index(to_lab(rgb.astype(np.float64)), lab_palette)
        done.append(outlined(merge_lone(indices, alpha, lab_palette), alpha, darkest, glow))
    return done, rgb_palette
