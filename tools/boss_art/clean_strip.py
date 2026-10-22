#!/usr/bin/env python3
"""Turn a generated animation strip into game frames, as a boss's spec file lists them.

    python3 tools/boss_art/clean_strip.py tools/boss_art/specs/khan.json

Image models hand back strips at any size, often on a painted checkerboard, with frames that are not
evenly spaced and blades that cross into the next frame. For each strip in the spec this lifts the
figures off the background (a real alpha channel, or a light grey checkerboard flood-filled from the
edges), cuts the frames apart on the spec's cut lines, shrinks them by one scale for the whole strip
and stands every frame on the sheet's feet line, then writes one row of exact frames. The same
inputs always give the same files.

A strip's spec:
    src, out       source image and the row to write, from the repo root
    frames         how many frames the source holds
    frameWidth, frameHeight, feetX, feetY    the frame size and where the feet stand in it
    refHeight      frame 0 is scaled to this height (the boss's idle height), or give `scale`
    cuts           optional x positions between frames; a cut may be bands [[y below, x], ...] where
                   a blade crosses into the next frame (default: the middle between the figures)
    anchor         'feet' (default: the middle of the lowest rows), 'centre' or 'right' (a leading edge)
    vcentre        stand frames on their common middle instead of the feet line (sparkles)
    island         drop loose specks smaller than this many pixels after shrinking (default 12)
    erase          optional [[frame, x, y, width, height], ...] boxes cleared in the written frames
"""
import json
import sys

import numpy as np
from PIL import Image


def lift_figures(pixels):
    if pixels[:, :, 3].min() < 255:
        return pixels[:, :, 3] > 128
    rgb = pixels[:, :, :3].astype(int)
    grey = (rgb.max(2) - rgb.min(2) < 22) & (rgb.max(2) > 120) & (rgb.max(2) < 222)
    background = np.zeros_like(grey)
    for edge in (np.s_[0], np.s_[-1], np.s_[:, 0], np.s_[:, -1]):
        background[edge] = grey[edge]
    while True:
        grown = background.copy()
        grown[1:] |= background[:-1]
        grown[:-1] |= background[1:]
        grown[:, 1:] |= background[:, :-1]
        grown[:, :-1] |= background[:, 1:]
        grown &= grey
        if (grown == background).all():
            return ~background
        background = grown


# the image's compression leaves loose specks: too few figure pixels around them
def drop_specks(mask, size=9, least=24):
    pad = size // 2
    sums = np.pad(np.pad(mask.astype(np.int32), pad).cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    height, width = mask.shape
    box = (
        sums[size : size + height, size : size + width]
        - sums[:height, size : size + width]
        - sums[size : size + height, :width]
        + sums[:height, :width]
    )
    return mask & (box >= least)


def pieces(mask, least=30):
    """(rows, columns) of each 4-connected piece of the mask of at least `least` pixels."""
    biggest = np.iinfo(np.int64).max
    labels = np.where(mask, np.arange(mask.size).reshape(mask.shape), biggest)
    while True:
        lowest = labels.copy()
        lowest[1:] = np.minimum(lowest[1:], labels[:-1])
        lowest[:-1] = np.minimum(lowest[:-1], labels[1:])
        lowest[:, 1:] = np.minimum(lowest[:, 1:], labels[:, :-1])
        lowest[:, :-1] = np.minimum(lowest[:, :-1], labels[:, 1:])
        lowest = np.where(mask, lowest, biggest)
        if (lowest == labels).all():
            break
        labels = lowest
    ids, counts = np.unique(labels[mask], return_counts=True)
    return [np.nonzero(labels == piece) for piece, count in zip(ids, counts) if count >= least]


def even_cuts(mask, count):
    smooth = np.convolve(mask.sum(0).astype(float), np.ones(41) / 41, mode='same')
    width = mask.shape[1]
    peaks = []
    for i in range(count):
        low, high = int(i * width / count), int((i + 1) * width / count)
        peaks.append(low + int(np.argmax(smooth[low:high])))
    return [(peaks[i] + peaks[i + 1]) // 2 for i in range(count - 1)]


def frame_of(cuts, xs, ys):
    frame = np.zeros(len(xs), dtype=int)
    for cut in cuts:
        if isinstance(cut, list):
            line = np.full(len(xs), cut[-1][1])
            for y_limit, x in reversed(cut):
                line = np.where(ys < y_limit, x, line)
        else:
            line = cut
        frame += xs >= line
    return frame


# a piece goes whole to the frame holding most of it; a body fused with its neighbour is cut on the line
def split_frames(mask, count, cuts):
    frames = [np.zeros_like(mask) for _ in range(count)]
    for ys, xs in pieces(mask):
        owners = frame_of(cuts, xs, ys)
        shares = np.bincount(owners, minlength=count) / len(owners)
        if (shares >= 0.15).sum() > 1 and len(owners) > 2000:
            for i in range(count):
                frames[i][ys[owners == i], xs[owners == i]] = True
        else:
            frames[int(np.argmax(shares))][ys, xs] = True
    return frames


def anchor_x(spec, mask, box):
    x0, y0, x1, y1 = box
    if spec.get('anchor') == 'centre':
        return (x0 + x1) / 2
    if spec.get('anchor') == 'right':
        return x1
    feet = np.nonzero(mask[max(y0, y1 - int(0.06 * (y1 - y0))) : y1].any(0))[0]
    return (feet.min() + feet.max()) / 2


def shrink(pixels, mask, box, scale, island):
    piece = pixels.copy()
    piece[:, :, 3] = np.where(mask, 255, 0)
    x0, y0, x1, y1 = box
    size = (max(1, round((x1 - x0) * scale)), max(1, round((y1 - y0) * scale)))
    small = np.array(Image.fromarray(piece).crop(box).resize(size, Image.LANCZOS))
    small[:, :, 3] = np.where(small[:, :, 3] >= 110, 255, 0)
    keep = np.zeros(small.shape[:2], dtype=bool)
    for ys, xs in pieces(small[:, :, 3] > 0, 1):
        if len(ys) >= island:
            keep[ys, xs] = True
    small[:, :, 3] = np.where(keep, small[:, :, 3], 0)
    return Image.fromarray(small)


def clean(spec):
    pixels = np.array(Image.open(spec['src']).convert('RGBA'))
    mask = drop_specks(lift_figures(pixels))
    count = spec['frames']
    frames = split_frames(mask, count, spec.get('cuts') or even_cuts(mask, count))
    boxes = []
    for frame in frames:
        ys, xs = np.nonzero(frame)
        boxes.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    scale = spec.get('scale') or spec['refHeight'] / (boxes[0][3] - boxes[0][1])
    line = np.median([(b[1] + b[3]) / 2 if spec.get('vcentre') else b[3] for b in boxes])
    width, height = spec['frameWidth'], spec['frameHeight']
    row = Image.new('RGBA', (width * count, height), (0, 0, 0, 0))
    for i, (frame, box) in enumerate(zip(frames, boxes)):
        small = shrink(pixels, frame, box, scale, spec.get('island', 12))
        left = spec['feetX'] + round((box[0] - anchor_x(spec, frame, box)) * scale)
        left = min(max(left, 0), width - small.width)
        top = max(0, spec['feetY'] - round((line - box[1]) * scale))
        row.alpha_composite(small, (i * width + left, top))
    for frame, x, y, box_width, box_height in spec.get('erase', []):
        cleared = np.array(row)
        cleared[y : y + box_height, frame * width + x : frame * width + x + box_width, 3] = 0
        row = Image.fromarray(cleared)
    row.save(spec['out'])
    print('wrote', spec['out'], 'at scale', round(scale, 3))


if __name__ == '__main__':
    for strip in json.load(open(sys.argv[1]))['strips']:
        clean(strip)
