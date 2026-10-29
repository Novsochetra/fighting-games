"""The pieces a pixel skin's shell is laid from, and the keys' cut-outs.

A phone's screen is never the painting's shape, so a shell is laid from long pieces anchored to its
edges: a grip running from the top of the screen and its foot from the bottom, a band reaching both
ways from its ornament. Where one piece lies over another, its edge fades out in an ordered dither
a few pixels deep, so the seam disappears into the stone's own grain wherever the two meet.
"""
import numpy as np
from PIL import Image

DEPTH = 4
# a 4x4 ordered dither: a pixel stays where its threshold is under the edge's cover at its depth
BAYER = (np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) + 0.5) / 16


def opaque(art):
    if art.shape[2] == 4:
        return art.copy()

    return np.dstack([art, np.full(art.shape[:2], 255, np.uint8)])


def faded_top(piece, depth=DEPTH):
    """`piece` with its top `depth` rows dithered out, most of all its first."""
    out = opaque(piece)
    columns = np.arange(out.shape[1])

    for row in range(depth):
        cover = (row + 0.5) / depth
        out[row, BAYER[row % 4, columns % 4] >= cover, 3] = 0

    return out


def faded(piece, side, depth=DEPTH):
    """`piece` with the edge on `side` ('top', 'bottom', 'left' or 'right') dithered out."""
    turns = {'top': 0, 'left': 3, 'bottom': 2, 'right': 1}[side]

    return np.rot90(faded_top(np.rot90(piece, turns), depth), -turns)


def extended_down(head, segment, length):
    """`head` carried on down to `length` rows by copies of `segment`, each laid over the end of
    the one before, its top dithered."""
    out = np.zeros((length, head.shape[1], 4), np.uint8)
    out[: len(head)] = opaque(head)[:length]
    copy = faded_top(segment)
    end = len(head)

    while end < length:
        start = end - DEPTH
        rows = min(len(copy), length - start)
        laid = copy[:rows]
        out[start : start + rows] = np.where(laid[..., 3:] > 0, laid, out[start : start + rows])
        end = start + rows

    return out


def extended_right(head, segment, length):
    turned = extended_down(np.rot90(head, -1), np.rot90(segment, -1), length)

    return np.rot90(turned, 1)


def extended_left(head, segment, length):
    flipped = extended_right(head[:, ::-1], segment[:, ::-1], length)

    return flipped[:, ::-1]


def folded(arts, colours):
    """Every piece's colours folded into one short palette, shared, so they match where they meet."""
    height = max(art.shape[0] for art in arts)
    sheet = np.zeros((height, sum(art.shape[1] for art in arts), 3), np.uint8)
    x = 0

    for art in arts:
        sheet[: art.shape[0], x : x + art.shape[1]] = art[..., :3]
        x += art.shape[1]

    palette = Image.fromarray(sheet).quantize(
        colors=colours, method=Image.Quantize.MEDIANCUT, kmeans=4, dither=Image.Dither.NONE
    )
    sheet = np.asarray(palette.convert('RGB'))
    out, x = [], 0

    for art in arts:
        rgb = sheet[: art.shape[0], x : x + art.shape[1]]
        out.append(np.dstack([rgb, art[..., 3]]) if art.shape[2] == 4 else rgb.copy())
        x += art.shape[1]

    return out


def centred_on(art, width, height):
    """`art` in the middle of a clear canvas `width` by `height`."""
    out = np.zeros((height, width, 4), np.uint8)
    top, left = (height - art.shape[0]) // 2, (width - art.shape[1]) // 2
    out[top : top + art.shape[0], left : left + art.shape[1]] = opaque(art)

    return out


def save(art, path):
    Image.fromarray(opaque(art), 'RGBA').save(path, format='WEBP', lossless=True, method=6)
    print(f'{path}: {art.shape[1]}x{art.shape[0]}')
