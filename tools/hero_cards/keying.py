"""Lifting the frames of a sheet drawn on flat magenta off their background, one figure each."""
import numpy as np
from scipy import ndimage as nd

EIGHT = np.ones((3, 3), bool)
# a figure's own pieces (a sword tip, a flying tail) count as part of it when they are this big or
# lie within this many pixels of its body; smaller specks further out are the model's noise
SPECK = 40
REACH = 24


# the model paints magenta a little off and blends it into the figure's edge, so anything where red
# and blue both stand well over green, about equally, is background
def figure_mask(sheet):
    red, green, blue = (sheet[..., channel].astype(int) for channel in range(3))
    magenta = (red - green > 90) & (blue - green > 90) & (np.abs(red - blue) < 80)
    return (sheet[..., 3] > 0) & ~magenta


def bodies_of(mask):
    labels, count = nd.label(mask, structure=EIGHT)
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    biggest = sizes.max() if count else 0
    return labels, [index for index in range(1, count + 1) if sizes[index] >= biggest * 0.25], sizes


def column_span(labels, index):
    xs = np.nonzero((labels == index).any(axis=0))[0]
    return xs.min(), xs.max()


# every piece goes to the body whose columns it overlaps, or else the nearest one in reach
def owner_of(span, spans, size):
    centre = (span[0] + span[1]) / 2
    gaps = [max(0, low - span[1], span[0] - high) for low, high in spans]
    nearest = int(np.argmin(gaps))
    if gaps[nearest] == 0 or (gaps[nearest] <= REACH and size >= SPECK // 4):
        return nearest
    return None if size < SPECK else int(np.argmin([abs(centre - (low + high) / 2) for low, high in spans]))


def split_frames(sheet):
    mask = figure_mask(sheet)
    labels, bodies, sizes = bodies_of(mask)
    bodies.sort(key=lambda index: column_span(labels, index)[0])
    spans = [column_span(labels, index) for index in bodies]
    pieces = [np.zeros_like(mask) for _ in bodies]
    for index in range(1, labels.max() + 1):
        owner = owner_of(column_span(labels, index), spans, sizes[index]) if sizes[index] else None
        if owner is not None:
            pieces[owner] |= labels == index
    return [cut_out(sheet, piece) for piece in pieces]


def cut_out(sheet, piece):
    ys, xs = np.nonzero(piece)
    top, bottom, left, right = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    out = sheet[top:bottom, left:right].copy()
    out[..., 3] = np.where(piece[top:bottom, left:right], 255, 0)
    return out
