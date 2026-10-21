"""Colors, masks and pixel painting shared by every Shade's effects.

Every pixel an effect paints comes from a short list of fixed colors, never a blend with what lies
under it, so a strip stays under the 256 colors of an indexed PNG and reads as pixel art.
"""
import numpy as np
from PIL import Image
from scipy import ndimage as nd

CROSS = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], bool)
EIGHT = np.ones((3, 3), bool)


def hx(code, alpha=255):
    code = code.lstrip('#')
    return np.array([int(code[i:i + 2], 16) for i in (0, 2, 4)] + [alpha], np.uint8)


def ramp(*codes):
    return [hx(code) for code in codes]


def luma(img):
    rgb = img[..., :3].astype(float)
    return (0.3 * rgb[..., 0] + 0.59 * rgb[..., 1] + 0.11 * rgb[..., 2]) / 255


def hsv(img):
    out = np.array(Image.fromarray(img[..., :3].astype(np.uint8), 'RGB').convert('HSV')).astype(float)
    return out[..., 0] * 360 / 255, out[..., 1] / 255, out[..., 2] / 255


def opaque(img):
    return img[..., 3] > 0


def shifted(mask, dx, dy):
    out = np.zeros_like(mask)
    height, width = mask.shape
    to_rows = slice(max(0, dy), height + min(0, dy))
    from_rows = slice(max(0, -dy), height + min(0, -dy))
    to_cols = slice(max(0, dx), width + min(0, dx))
    from_cols = slice(max(0, -dx), width + min(0, -dx))
    out[to_rows, to_cols] = mask[from_rows, from_cols]
    return out


# the pixels of a mask whose neighbour one step along (dx, dy) lies outside it: dx=-1 is the edge
# facing back (every hero faces right), dy=-1 the edge facing up
def side_edge(mask, dx, dy):
    return mask & ~shifted(mask, -dx, -dy)


def inner_edge(mask):
    return mask & ~nd.binary_erosion(mask, structure=CROSS)


def outer_ring(mask, diagonal=False):
    return nd.binary_dilation(mask, structure=EIGHT if diagonal else CROSS) & ~mask


def interior(mask, depth=1):
    return nd.binary_erosion(mask, structure=CROSS, iterations=depth)


def box(mask):
    ys, xs = np.nonzero(mask)
    if len(xs) == 0:
        return None
    return ys.min(), ys.max(), xs.min(), xs.max()


def rows_between(mask, top, bottom):
    out = np.zeros_like(mask)
    out[max(0, top):max(0, bottom + 1)] = mask[max(0, top):max(0, bottom + 1)]
    return out


def paint(img, mask, color):
    img[mask] = color


# a pixel set only where nothing is drawn yet, for glow that lies behind the hero
def paint_behind(img, mask, color):
    img[mask & ~opaque(img)] = color


def put(img, x, y, color, behind=False):
    xi, yi = int(round(x)), int(round(y))
    if not (0 <= xi < img.shape[1] and 0 <= yi < img.shape[0]):
        return
    if behind and img[yi, xi, 3] > 0:
        return
    if color[3] < 255 and img[yi, xi, 3] == 255:
        return
    img[yi, xi] = color


def stamp(img, x, y, pattern, behind=False):
    for dx, dy, color in pattern:
        put(img, x + dx, y + dy, color, behind)


# a soft one-pixel halo of `color` round `mask`, laid only on empty pixels
def halo(img, mask, color, diagonal=False):
    paint_behind(img, outer_ring(mask, diagonal), color)


def hue_mask(img, low, high, min_sat=0.35, min_val=0.45):
    hue, sat, val = hsv(img)
    inside = (hue >= low) & (hue <= high) if low <= high else (hue >= low) | (hue <= high)
    return opaque(img) & inside & (sat >= min_sat) & (val >= min_val)


# brightness of each pixel picked into one of the ramp's steps, darkest first
def ramp_by_light(img, mask, colors, cuts):
    light = luma(img)
    out = img.copy()
    for y, x in zip(*np.nonzero(mask)):
        step = int(np.searchsorted(cuts, light[y, x]))
        out[y, x] = colors[min(step, len(colors) - 1)]
    return out


def hashed(x, y, salt=0):
    value = (x * 73856093) ^ (y * 19349663) ^ (salt * 83492791)
    return (value & 0xFFFF) / 0xFFFF
