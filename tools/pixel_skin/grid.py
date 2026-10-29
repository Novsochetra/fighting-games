"""Read a painting's pixel art back at the size it was drawn.

ChatGPT paints "pixel art" as blocks a few pixels wide, on a grid that drifts across the image: the
Sandstone shell's blocks were 6.6 to 6.9 px in one painting and 7.8 to 8 in the other. So each
region (a grip, a band, a key) is read on a grid of its own, the whole number of blocks across it
whose edges best meet where its colours change, and one colour is read from the middle of every
block, a 3x3 median against the painting's grain.
"""
import numpy as np

# a colour change this big between two neighbouring pixels is the edge of a block
EDGE = 90
# blocks are 6 to 9 px in every painting so far; half or twice a block falls outside this, so
# the fit never takes a grid of half blocks, which meets every edge as well as the true one
CELL_SIZES = (5.0, 11.0)
DARK = 45


def lightness(image):
    return image[..., :3].astype(int).mean(axis=2)


def content_box(image):
    """The painting inside the dark margin ChatGPT leaves round it."""
    dark = lightness(image) < DARK
    rows = np.flatnonzero(dark.mean(axis=1) < 0.5)
    columns = np.flatnonzero(dark.mean(axis=0) < 0.5)

    return columns[0], rows[0], columns[-1] + 1, rows[-1] + 1


def window_box(image, seed):
    """The black window the game's screen stands in, grown out from a point inside it."""
    dark = lightness(image) < DARK
    x, y = seed
    left = x - np.argmin(dark[y, x::-1])
    right = x + np.argmin(dark[y, x:])
    top = y - np.argmin(dark[y::-1, x])
    bottom = y + np.argmin(dark[y:, x])

    return left + 1, top + 1, right, bottom


def edge_counts(region, axis):
    """How many colour changes fall on each boundary between two pixels along `axis` (1 for x)."""
    steps = np.abs(np.diff(region[..., :3].astype(int), axis=axis)).sum(axis=2) > EDGE

    return steps.sum(axis=1 - axis)


def miss_of(counts, blocks):
    """How far the colour changes along one axis fall from the edges of `blocks` equal blocks, on
    average, as a share of a block."""
    length = len(counts) + 1
    size = length / blocks
    offset = np.arange(1, length) % size

    return (np.minimum(offset, size - offset) / size * counts).sum() / max(1, counts.sum())


def block_range(length):
    low, high = CELL_SIZES

    return range(max(1, int(length / high)), int(length / low) + 1)


def blocks_across(counts):
    """The whole number of blocks across a region whose edges best meet its colour changes."""
    return min(block_range(len(counts) + 1), key=lambda blocks: miss_of(counts, blocks))


def square_blocks(region):
    """Columns and rows of one block size, whose edges best meet the colour changes both ways.
    Read on its own, each axis can take a grid the other does not: a round key painted 290 by
    295 px came out 36 by 39 pixels, an oval, its blocks 8.06 by 7.56"""
    height, width = region.shape[:2]
    across, down = edge_counts(region, 1), edge_counts(region, 0)

    def fit(columns):
        rows = max(1, round(height * columns / width))

        return miss_of(across, columns) + miss_of(down, rows), columns, rows

    _, columns, rows = min(fit(columns) for columns in block_range(width))

    return columns, rows


def read_region(image, box, square=False):
    """The pixel art in `box` of the painting, one pixel for each block it was painted as; on
    square blocks for art whose shape shows, as a key's does."""
    left, top, right, bottom = box
    region = image[top:bottom, left:right]
    height, width = region.shape[:2]

    if square:
        columns, rows = square_blocks(region)
    else:
        columns, rows = blocks_across(edge_counts(region, 1)), blocks_across(edge_counts(region, 0))

    xs = ((np.arange(columns) + 0.5) * width / columns).astype(int)
    ys = ((np.arange(rows) + 0.5) * height / rows).astype(int)
    samples = [
        region[np.clip(ys + dy, 0, height - 1)][:, np.clip(xs + dx, 0, width - 1)]
        for dy in (-1, 0, 1)
        for dx in (-1, 0, 1)
    ]

    return np.median(np.stack(samples), axis=0).astype(np.uint8)
