#!/usr/bin/env python3
"""Bake a pixel-art skin from ChatGPT's paintings (assets/skins/README.md, "Pixel skins").

    python3 tools/pixel_skin/bake.py landscape PAINTING OUT_DIR
        the shell held sideways, its window in the middle: each grip running down from the top
        (landscape-left.png, landscape-right.png) and its foot (…-foot.png), the top and the
        bottom band reaching both ways from their ornaments (landscape-top.png, …-bottom.png)
    python3 tools/pixel_skin/bake.py portrait PAINTING OUT_DIR
        the shell held upright, its window at the top: the rim round the window (portrait-crown),
        the emblem under it running down (portrait-body) and the foot (portrait-foot)
    python3 tools/pixel_skin/bake.py keys SHEET OUT_DIR
        the controls, painted on magenta three by two: the d-pad, a round key up and pressed, a pill
        key up and pressed, each cut out, a pressed key on its key's canvas

Every piece is read back at the size it was painted (grid.py) and laid out as pieces.py says.
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pixel_skin.grid import content_box, read_region, window_box  # noqa: E402
from pixel_skin.pieces import (centred_on, extended_down, extended_left, extended_right,  # noqa: E402
                               faded, folded, save)

COLOURS = 32
# a grip's foot is its lower third, its corner ornaments; plain stone above them, clear of the moss,
# carries the grip on, ending where the foot starts so the two meet as painted
FOOT = 0.65
GRIP_SEGMENT = (0.44, 0.65)
# long enough for a tablet: the pieces are drawn some 3.7 px a pixel, and the screen cuts them off
GRIP_LENGTH = 320
BAND_LENGTH = 640
BAND_SEGMENTS = ((0.06, 0.3), (0.7, 0.94))
# the band's last few columns meet the grips' trim, which the grips draw themselves
BAND_TRIM = 3
CROWN_LENGTH = 160
SIDE_SEGMENT = (0.3, 0.9)
# the painted window's own trim under it: the game's screen is wider and has a trim of its own
WINDOW_TRIM = 2
BODY_FOOT = 0.54
BODY_SEGMENT = (0.42, 0.54)
BODY_LENGTH = 360
KEY_COLOURS = 24
# each key's cell in the sheet, by column and row, and the key whose canvas it shares
KEYS = {
    'dpad': ((0, 0), 'dpad'),
    'key-round': ((1, 0), 'key-round'),
    'key-round-pressed': ((2, 0), 'key-round'),
    'key-pill': ((0, 1), 'key-pill'),
    'key-pill-pressed': ((1, 1), 'key-pill'),
}
SQUARE = {'dpad', 'key-round'}
# the sheet's cells are parted by thin lines
CELL_INSET = 12


def load(path, mode='RGB'):
    return np.asarray(Image.open(path).convert(mode))


def rows_of(art, start, end):
    height = len(art)

    return art[round(start * height) : round(end * height)]


def columns_of(art, start, end):
    width = art.shape[1]

    return art[:, round(start * width) : round(end * width)]


def window_colour_of(image, window):
    """The window's black, printed so the skin's stylesheet paints the shell's window the same."""
    left, top, right, bottom = window
    colour = np.median(image[top:bottom, left:right].reshape(-1, 3), axis=0)
    print('window', '#%02x%02x%02x' % tuple(int(channel) for channel in colour))

    return colour


def read_all(image, boxes):
    return folded([read_region(image, box) for box in boxes], COLOURS)


def grip_pieces(grip):
    foot_at = round(FOOT * len(grip))
    head = extended_down(grip[:foot_at], rows_of(grip, *GRIP_SEGMENT), GRIP_LENGTH)

    return head, faded(grip[foot_at:], 'top')


def long_band(band):
    band = band[:, BAND_TRIM:-BAND_TRIM]
    (left_start, left_end), (right_start, right_end) = BAND_SEGMENTS
    reach = (BAND_LENGTH + band.shape[1]) // 2
    right = extended_right(band, columns_of(band, right_start, right_end), reach)
    left_segment = columns_of(band, left_start, left_end)

    return extended_left(right, left_segment, BAND_LENGTH)


def landscape(painting, out_dir):
    image = load(painting)
    left, top, right, bottom = content_box(image)
    window = window_box(image, (image.shape[1] // 2, image.shape[0] // 2))
    window_left, window_top, window_right, window_bottom = window
    boxes = [
        (left, top, window_left, bottom),
        (window_right, top, right, bottom),
        (window_left, top, window_right, window_top),
        (window_left, window_bottom, window_right, bottom),
    ]
    grip_left, grip_right, band_top, band_bottom = read_all(image, boxes)

    for side, grip in (('left', grip_left), ('right', grip_right)):
        head, foot = grip_pieces(grip)
        save(head, f'{out_dir}/landscape-{side}.png')
        save(foot, f'{out_dir}/landscape-{side}-foot.png')

    save(long_band(band_top), f'{out_dir}/landscape-top.png')
    save(long_band(band_bottom), f'{out_dir}/landscape-bottom.png')
    window_colour_of(image, window)


def crown_of(top, sides, window_colour):
    """The rim above and beside the window, carried on down; under the window, its own colour."""
    crown = np.zeros((CROWN_LENGTH, top.shape[1], 4), np.uint8)
    crown[..., :3] = window_colour
    crown[..., 3] = 255
    crown[: len(top)] = np.dstack([top, np.full(top.shape[:2], 255, np.uint8)])
    side_length = CROWN_LENGTH - len(top)

    for side, x in zip(sides, (0, top.shape[1] - sides[1].shape[1])):
        carried = extended_down(side, rows_of(side, *SIDE_SEGMENT), side_length)
        crown[len(top) :, x : x + side.shape[1]] = carried

    return crown


def portrait(painting, out_dir):
    image = load(painting)
    left, top, right, bottom = content_box(image)
    window = window_box(image, (image.shape[1] // 2, image.shape[0] // 6))
    window_left, window_top, window_right, window_bottom = window
    boxes = [
        (left, top, right, window_top),
        (left, window_top, window_left, window_bottom),
        (window_right, window_top, right, window_bottom),
        (left, window_bottom, right, bottom),
    ]
    crown_top, side_left, side_right, body = read_all(image, boxes)
    crown = crown_of(crown_top, (side_left, side_right), window_colour_of(image, window))
    body = body[WINDOW_TRIM:]
    foot_at = round(BODY_FOOT * len(body))
    carried = extended_down(body[:foot_at], rows_of(body, *BODY_SEGMENT), BODY_LENGTH)

    save(crown, f'{out_dir}/portrait-crown.png')
    save(carried, f'{out_dir}/portrait-body.png')
    save(faded(body[foot_at:], 'top'), f'{out_dir}/portrait-foot.png')


def keyed(sheet):
    """The sheet with its magenta, and the magenta blended into the keys' edges, made clear."""
    red, green, blue = (sheet[..., channel].astype(int) for channel in range(3))
    magenta = (red > green + 30) & (blue > green + 30)
    out = sheet.copy()
    out[..., 3] = np.where(magenta, 0, 255)

    return out


def key_art(sheet, column, row):
    height, width = sheet.shape[0] // 2, sheet.shape[1] // 3
    left, top = column * width + CELL_INSET, row * height + CELL_INSET
    cell = sheet[top : top + height - 2 * CELL_INSET, left : left + width - 2 * CELL_INSET]
    ys, xs = np.nonzero(cell[..., 3])

    box = (left + xs.min(), top + ys.min(), left + xs.max() + 1, top + ys.max() + 1)

    return read_region(sheet, box, square=True)


def keys(source, out_dir):
    sheet = keyed(load(source, 'RGBA'))
    arts = dict(zip(KEYS, folded([key_art(sheet, *cell) for cell, _ in KEYS.values()], KEY_COLOURS)))

    for name, (_, canvas_of) in KEYS.items():
        shared = [art.shape[:2] for key, art in arts.items() if KEYS[key][1] == canvas_of]
        height, width = np.max(shared, axis=0)

        if canvas_of in SQUARE:
            height = width = max(height, width)

        save(centred_on(arts[name], width, height), f'{out_dir}/{name}.png')


def main():
    command, source, out_dir = sys.argv[1:]
    {'landscape': landscape, 'portrait': portrait, 'keys': keys}[command](source, out_dir)


if __name__ == '__main__':
    main()
