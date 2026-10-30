#!/usr/bin/env python3
"""Bake a pixel-art skin from ChatGPT's paintings (assets/skins/README.md, "Pixel skins").

    python3 tools/pixel_skin/bake.py landscape PAINTING OUT_DIR [--block N] [--frame] [--clear BOX]…
        the shell held sideways, its window in the middle: each grip running down from the top
        (landscape-left.png, landscape-right.png) and its foot (…-foot.png), the top and the
        bottom band reaching both ways from their ornaments (landscape-top.png, …-bottom.png)
    python3 tools/pixel_skin/bake.py portrait PAINTING OUT_DIR [--block N] [--trim ROWS] [--frame]
                                                      [--clear BOX]…
        the shell held upright, its window at the top: the rim round the window (portrait-crown),
        the emblem under it running down (portrait-body) and the foot (portrait-foot)
    python3 tools/pixel_skin/bake.py keys SHEET OUT_DIR
        the controls, painted on magenta three by two: the d-pad, a round key up and pressed, a pill
        key up and pressed, each cut out, a pressed key on its key's canvas (keys.py)

Every piece is read back at the size it was painted (grid.py), or with --block as painted, and
laid out as pieces.py says.
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pixel_skin.grid import content_box, framed_box, read_painted, read_region, window_box  # noqa: E402
from pixel_skin.keys import bake_keys  # noqa: E402
from pixel_skin.pieces import extended_down, extended_left, extended_right, faded, folded, save  # noqa: E402

COLOURS = 32
# a grip's foot is its lower third, its corner ornaments; plain stone above them, clear of the moss,
# carries the grip on, ending where the foot starts so the two meet as painted
FOOT = 0.65
GRIP_SEGMENT = (0.44, 0.65)
# long enough for a tablet, in widths of a grip: a grip is drawn as wide as the shell beside the
# game's screen, 170 px or more, so 7 of them reach past a tablet's 1024, and the screen cuts the rest
GRIP_LENGTH = 7
BAND_LENGTH = 14
BAND_SEGMENTS = ((0.06, 0.3), (0.7, 0.94))
# the band's last few columns meet the grips' trim, which the grips draw themselves
BAND_TRIM = 3
# in their own widths: drawn as wide as the screen held upright, 1.3 and 2.9 of them reach past a
# phone's or a tablet's height
CROWN_LENGTH = 1.3
SIDE_SEGMENT = (0.3, 0.9)
# the painted window's own trim under it: the game's screen is wider and has a trim of its own
# (--trim, for a painting whose frame under the window is deeper)
WINDOW_TRIM = 2
BODY_FOOT = 0.54
BODY_SEGMENT = (0.42, 0.54)
BODY_LENGTH = 2.9

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


def read_all(image, boxes, block):
    if block:
        return folded([read_painted(image, box, block) for box in boxes], COLOURS)

    return folded([read_region(image, box) for box in boxes], COLOURS)


def grip_pieces(grip):
    foot_at = round(FOOT * len(grip))
    length = round(GRIP_LENGTH * grip.shape[1])
    head = extended_down(grip[:foot_at], rows_of(grip, *GRIP_SEGMENT), length)

    return head, faded(grip[foot_at:], 'top')


def long_band(band, length):
    band = band[:, BAND_TRIM:-BAND_TRIM]
    (left_start, left_end), (right_start, right_end) = BAND_SEGMENTS
    reach = (length + band.shape[1]) // 2
    right = extended_right(band, columns_of(band, right_start, right_end), reach)
    left_segment = columns_of(band, left_start, left_end)

    return extended_left(right, left_segment, length)


def cleared(image, boxes):
    """The painting with each box covered by plain shell from beside it, the plainest neighbour of
    its size: an LED, screws or a speaker painted where the keys stand show round them"""
    out = image.copy()
    height_of, width_of = image.shape[:2]

    for left, top, right, bottom in boxes:
        width, height = right - left, bottom - top
        sources = [(left, top - height), (left, bottom), (left - width, top), (right, top)]
        inside = [(x, y) for x, y in sources
                  if x >= 0 and y >= 0 and x + width <= width_of and y + height <= height_of]
        x, y = min(inside, key=lambda at: image[at[1] : at[1] + height, at[0] : at[0] + width].std())
        out[top:bottom, left:right] = image[y : y + height, x : x + width]

    return out


def box_of(text):
    return tuple(int(value) for value in text.split(','))


def window_of(image, seed, frame):
    window = window_box(image, seed)

    return framed_box(window, image) if frame else window


def landscape(image, out_dir, block=None, frame=False):
    left, top, right, bottom = content_box(image)
    window = window_of(image, (image.shape[1] // 2, image.shape[0] // 2), frame)
    window_left, window_top, window_right, window_bottom = window
    boxes = [
        (left, top, window_left, bottom),
        (window_right, top, right, bottom),
        (window_left, top, window_right, window_top),
        (window_left, window_bottom, window_right, bottom),
    ]
    grip_left, grip_right, band_top, band_bottom = read_all(image, boxes, block)
    band_length = round(BAND_LENGTH * grip_left.shape[1])

    for side, grip in (('left', grip_left), ('right', grip_right)):
        head, foot = grip_pieces(grip)
        save(head, f'{out_dir}/landscape-{side}.png')
        save(foot, f'{out_dir}/landscape-{side}-foot.png')

    save(long_band(band_top, band_length), f'{out_dir}/landscape-top.png')
    save(long_band(band_bottom, band_length), f'{out_dir}/landscape-bottom.png')
    window_colour_of(image, window)


def crown_of(top, sides, window_colour):
    """The rim above and beside the window, carried on down; under the window, its own colour."""
    length = round(CROWN_LENGTH * top.shape[1])
    crown = np.zeros((length, top.shape[1], 4), np.uint8)
    crown[..., :3] = window_colour
    crown[..., 3] = 255
    crown[: len(top)] = np.dstack([top, np.full(top.shape[:2], 255, np.uint8)])
    side_length = length - len(top)

    for side, x in zip(sides, (0, top.shape[1] - sides[1].shape[1])):
        carried = extended_down(side, rows_of(side, *SIDE_SEGMENT), side_length)
        crown[len(top) :, x : x + side.shape[1]] = carried

    return crown


def portrait(image, out_dir, block=None, trim=WINDOW_TRIM, frame=False):
    left, top, right, bottom = content_box(image)
    window = window_of(image, (image.shape[1] // 2, image.shape[0] // 6), frame)
    window_left, window_top, window_right, window_bottom = window
    boxes = [
        (left, top, right, window_top),
        (left, window_top, window_left, window_bottom),
        (window_right, window_top, right, window_bottom),
        (left, window_bottom, right, bottom),
    ]
    crown_top, side_left, side_right, body = read_all(image, boxes, block)
    crown = crown_of(crown_top, (side_left, side_right), window_colour_of(image, window))
    body = body[trim:]
    foot_at = round(BODY_FOOT * len(body))
    length = round(BODY_LENGTH * body.shape[1])
    carried = extended_down(body[:foot_at], rows_of(body, *BODY_SEGMENT), length)

    save(crown, f'{out_dir}/portrait-crown.png')
    save(carried, f'{out_dir}/portrait-body.png')
    save(faded(body[foot_at:], 'top'), f'{out_dir}/portrait-foot.png')


def main():
    parser = argparse.ArgumentParser(description='Bake a pixel-art skin from ChatGPT\'s paintings.')
    parser.add_argument('command', choices=['landscape', 'portrait', 'keys'])
    parser.add_argument('source')
    parser.add_argument('out_dir')
    parser.add_argument('--block', type=float,
                        help='read a shell as painted, every N by N px one pixel, for a painting '
                             'whose blocks are no one size (grid.py, read_painted)')
    parser.add_argument('--trim', type=int, default=WINDOW_TRIM,
                        help='rows of the painted frame under the upright window to leave out')
    parser.add_argument('--clear', type=box_of, action='append', default=[], metavar='X0,Y0,X1,Y1',
                        help='cover this box of the painting with plain shell from beside it, for a '
                             'detail painted where the keys stand (an LED, screws, a speaker)')
    parser.add_argument('--frame', action='store_true',
                        help='the window takes in the frame round the black, a screen\'s bezel, '
                             'so the grips are the shell alone and no key stands on the bezel')
    args = parser.parse_args()
    image = load(args.source, 'RGBA' if args.command == 'keys' else 'RGB')

    if args.clear:
        image = cleared(image, args.clear)

    if args.command == 'keys':
        bake_keys(image, args.out_dir)
    elif args.command == 'landscape':
        landscape(image, args.out_dir, args.block, args.frame)
    else:
        portrait(image, args.out_dir, args.block, args.trim, args.frame)


if __name__ == '__main__':
    main()
