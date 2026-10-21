"""Bringing a big drawn frame down to the game's size, colours and outline, standing on its feet."""
import numpy as np
from PIL import Image
from scipy import ndimage as nd

from .sheet import FH, FW

CROSS = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], bool)
FEET_ROWS = 5
PALETTE_SIZE = 56
LIT_EDGE = 3 * 70
BODY_WIDTH = 0.35


# from the feet to the top of the head: a raised blade, a thin row as wide as a sword, does not
# count, so a hero holding his sword up is shrunk to the same size as one holding it low
def height_of(frame):
    widths = (frame[..., 3] > 0).sum(1)
    thick = np.nonzero(widths >= max(2, np.median(widths[widths > 0]) * BODY_WIDTH))[0]
    return thick.max() - thick.min() + 1


# one short palette for every frame of a loop, so a colour never flickers between two near ones
def palette_of(frames, colours=PALETTE_SIZE):
    pixels = np.concatenate([frame[frame[..., 3] > 0][:, :3] for frame in frames])
    strip = Image.fromarray(pixels[None, :, :].astype(np.uint8), 'RGB')
    picked = strip.quantize(colours, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    return np.array(picked.getpalette()[:colours * 3]).reshape(-1, 3)


def palette_index(frame, palette):
    out = np.full(frame.shape[:2], -1)
    solid = frame[..., 3] > 0
    pixels = frame[solid][:, :3].astype(int)
    weights = np.array([3, 4, 2])
    out[solid] = (((pixels[:, None, :] - palette[None, :, :]) ** 2) * weights).sum(-1).argmin(1)
    return out


def edges(length, scale):
    return np.round(np.arange(round(length * scale) + 1) / scale).astype(int)


# each small pixel takes the palette colour that covers most of it, and is left empty where the
# figure covers less than half of it; averaging instead mixed the drawing's dark lines into its
# skin and cloth and turned them muddy
def shrink(frame, scale, palette):
    index = palette_index(frame, palette)
    rows, cols = edges(frame.shape[0], scale), edges(frame.shape[1], scale)
    out = np.zeros((len(rows) - 1, len(cols) - 1, 4), np.uint8)
    for y in range(len(rows) - 1):
        for x in range(len(cols) - 1):
            block = index[rows[y]:rows[y + 1], cols[x]:cols[x + 1]].ravel()
            drawn = block[block >= 0]
            if drawn.size * 2 >= block.size and drawn.size:
                out[y, x, :3] = palette[np.bincount(drawn).argmax()]
                out[y, x, 3] = 255
    return out


# a lone pixel unlike every neighbour round it is the sheet's grain, not the drawing: it takes the
# colour most of its neighbours have
def despeckled(frame):
    out = frame.copy()
    height, width = frame.shape[:2]
    for y in range(1, height - 1):
        for x in range(1, width - 1):
            out[y, x] = settled(frame, x, y)
    return out


def settled(frame, x, y):
    around = frame[y - 1:y + 2, x - 1:x + 2].reshape(9, 4)
    centre = around[4]
    others = np.delete(around, 4, axis=0)
    if centre[3] == 0 or (others[:, 3] == 0).any() or (others == centre).all(1).any():
        return centre
    colours, counts = np.unique(others, axis=0, return_counts=True)
    return colours[counts.argmax()]


# the drawing keeps most of its own dark line through the shrink; the outline only closes it where a
# lit pixel would otherwise touch the background
def outlined(frame, ink):
    solid = frame[..., 3] > 0
    light = solid & (frame[..., :3].astype(int).sum(-1) > LIT_EDGE)
    ring = nd.binary_dilation(light & ~nd.binary_erosion(solid, structure=CROSS), structure=CROSS) & ~solid
    out = frame.copy()
    out[ring] = ink
    return out


def feet_of(frame):
    ys, xs = np.nonzero(frame[..., 3] > 0)
    bottom = ys.max()
    low = xs[ys > bottom - FEET_ROWS]
    return (low.min() + low.max()) / 2, bottom


# set on a frame of the game's size with the middle of the feet on `feet` (x, bottom row)
def stand(frame, feet):
    out = np.zeros((FH, FW, 4), np.uint8)
    feet_x, bottom = feet_of(frame)
    left = int(round(feet[0] - feet_x))
    top = int(feet[1] - bottom)
    height, width = frame.shape[:2]
    src_top, src_left = max(0, -top), max(0, -left)
    dst_top, dst_left = max(0, top), max(0, left)
    rows = min(height - src_top, FH - dst_top)
    cols = min(width - src_left, FW - dst_left)
    piece = frame[src_top:src_top + rows, src_left:src_left + cols]
    solid = piece[..., 3] > 0
    out[dst_top:dst_top + rows, dst_left:dst_left + cols][solid] = piece[solid]
    return out


def feet_mask(frame):
    solid = frame[..., 3] > 0
    bottom = np.nonzero(solid.any(1))[0].max()
    return solid[bottom - FEET_ROWS + 1:bottom + 1]


def shifted_across(frame, dx):
    out = np.zeros_like(frame)
    if dx >= 0:
        out[:, dx:] = frame[:, :frame.shape[1] - dx]
    else:
        out[:, :dx] = frame[:, -dx:]
    return out


# the drawn feet wander a pixel or two between frames; each frame moves sideways to where its feet
# cover the first frame's best, so the hero does not shuffle on the spot
def steadied(frames):
    anchor = feet_mask(frames[0])
    out = [frames[0]]
    for frame in frames[1:]:
        overlap = {dx: (feet_mask(shifted_across(frame, dx)) & anchor).sum() for dx in range(-3, 4)}
        out.append(shifted_across(frame, max(overlap, key=lambda dx: (overlap[dx], -abs(dx)))))
    return out
