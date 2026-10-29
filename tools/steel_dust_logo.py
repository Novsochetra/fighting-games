#!/usr/bin/env python3
"""Steel & Dust's logo, drawn pixel by pixel: STEEL in chrome, a sword under it, & DUST in sandstone.

    python3 tools/steel_dust_logo.py [OUT_DIR]

Writes logo.png, at its own size (the menus draw it at 1x, 2x or 3x), to
apps/web/games/steel-and-dust/assets/ui/logo/ (or OUT_DIR). Every letter is a polygon on the pixel
grid, filled where a pixel's centre falls inside, so its cuts come out as clean 45 degree steps.
"""
import os
import sys

import numpy as np
from PIL import Image

CAP = 30
BAR = 7
MID_BAR = 6
STEM = 7
CUT = 5
TRACKING = 2
SLANT_EVERY = 5
LINE_GAP = 12
DUST_OVERHANG = 4
AMP_GAP = 4
TIP_REACH = 8
MARGIN = 40

OUTLINE = '#140f1a'
CHROME = ['#ffffff', '#f6f9fd', '#f6f9fd', '#e6eef7', '#e6eef7', '#e6eef7', '#d3e0ee', '#d3e0ee',
          '#d3e0ee', '#bccfe3', '#bccfe3', '#bccfe3', '#a5bcd6', '#a5bcd6', '#28314b', '#364261',
          '#4b5a78', '#4b5a78', '#61718e', '#61718e', '#7a8aa5', '#7a8aa5', '#95a5bc', '#95a5bc',
          '#b1bfd1', '#b1bfd1', '#ccd7e4', '#ccd7e4', '#e5ecf3', '#e5ecf3']
CHROME_EDGES = {'light': '#ffffff', 'shade': '#4a5874'}
CHROME_DEPTH = ['#3a4664', '#2a3350', '#1e253c']
SAND = ['#fff1b8', '#ffeeb0', '#ffeeb0', '#ffeeb0', '#ffe38f', '#ffe38f', '#ffe38f', '#ffd770',
        '#ffd770', '#ffd770', '#fdc65c', '#fdc65c', '#fdc65c', '#f8b44c', '#f8b44c', '#f8b44c',
        '#f2a33a', '#f2a33a', '#f2a33a', '#e98f31', '#e98f31', '#e98f31', '#de7c2a', '#de7c2a',
        '#de7c2a', '#cf6a23', '#cf6a23', '#cf6a23', '#bc5a1e', '#bc5a1e']
SAND_EDGES = {'light': '#fff1b8', 'shade': '#a8481a'}
SAND_DEPTH = ['#8a3b12', '#6c2c0e', '#4e1f0b']
GRIT_SHARE = 0.045

SWORD_COLORS = {'W': '#ffffff', 'l': '#e4ecf6', 'm': '#c3cfde', 'd': '#8e9db3', 'k': '#5f6d86',
                'L': '#fff1b8', 'G': '#ffd36b', 'A': '#f2a33a', 'R': '#b4561c', 'B': '#a8723c',
                'b': '#5e3b1e', 'g': '#59c9a5', 'h': '#bff3ff'}
BLADE_ROWS = 'Wllmmdk'
FULLER_ROW, FULLER_SHARE = 3, 0.62
GRIP = """
..LG...BbBbBbBbB
.LGGA..bBbBbBbBb
LGGGARRBbBbBbBbB
.GAAR..bBbBbBbBb
..AR...BbBbBbBbB
""".strip('\n').splitlines()
GUARD = """
...LG...
...LGA..
..LGGA..
..LGGA..
..LGGA..
.LGGGAR.
.LGGGAR.
LGGhgGAR
LGgggGAR
LGGggGAR
.GGGGAR.
.GGGGAR.
..GGAR..
..GGAR..
..GGAR..
...AR...
...AR...
""".strip('\n').splitlines()
GLINT = """
....W....
....W....
...lWl...
WWWWWWWWW
...lWl...
....W....
....W....
""".strip('\n').splitlines()

AMPERSAND = """
.....######........
....########.......
...##########......
..#####..#####.....
..####....####.....
..####....####.....
..#####..#####.....
...##########......
...#########.......
...#######.........
..#########...####.
.###########.#####.
.####.######.#####.
#####..##########..
#####...#########..
#####....#######...
######...#######...
.###############...
.################..
..################.
....#######..######
""".strip('\n').splitlines()

PUFFS = [(-1, -4, 5.5), (-5, -9, 3.6), (2, -9, 3.0), (-10, -6, 4.2), (-13, -10, 2.8), (-17, -12, 3.2),
         (-21, -16, 2.2), (-25, -20, 1.3), (-28, -14, 1.3)]
PUFF_COLORS = {'light': '#f1e7d6', 'base': '#e2b57d', 'dark': '#b07d4f'}
GLINT_COLORS = {'W': '#ffffff', 'l': '#bfe9ff'}


def resample(colors, rows):
    return [colors[row * len(colors) // rows] for row in range(rows)]


def hex_rgb(color):
    return tuple(int(color[i:i + 2], 16) for i in (1, 3, 5))


def rasterize(rings, width, height):
    ys, xs = np.mgrid[0:height, 0:width] + 0.5
    inside = np.zeros((height, width), bool)
    for ring in rings:
        inside ^= ring_mask(ring, xs, ys)
    return inside


def ring_mask(ring, xs, ys):
    inside = np.zeros(xs.shape, bool)
    for (x0, y0), (x1, y1) in zip(ring, ring[1:] + ring[:1]):
        if y0 == y1:
            continue
        crosses = (ys >= min(y0, y1)) & (ys < max(y0, y1))
        x_at = x0 + (ys - y0) * (x1 - x0) / (y1 - y0)
        inside ^= crosses & (xs < x_at)
    return inside


def glyph_s(w):
    h, mid = CAP, (CAP - MID_BAR) // 2
    return [[(CUT, 0), (w, 0), (w, BAR), (STEM, BAR), (STEM, mid), (w - CUT, mid), (w, mid + CUT),
             (w, h - CUT), (w - CUT, h), (0, h), (0, h - BAR), (w - STEM, h - BAR),
             (w - STEM, mid + MID_BAR), (CUT, mid + MID_BAR), (0, mid + MID_BAR - CUT), (0, CUT)]]


def glyph_t(w):
    left = (w - STEM) // 2
    return [[(0, 0), (w, 0), (w, BAR), (left + STEM, BAR), (left + STEM, CAP), (left, CAP),
             (left, BAR), (0, BAR)]]


def glyph_e(w):
    h, mid = CAP, (CAP - MID_BAR) // 2
    return [[(CUT, 0), (w, 0), (w, BAR), (STEM, BAR), (STEM, mid), (w - 2, mid), (w - 2, mid + MID_BAR),
             (STEM, mid + MID_BAR), (STEM, h - BAR), (w, h - BAR), (w, h), (CUT, h), (0, h - CUT),
             (0, CUT)]]


def glyph_l(w):
    return [[(0, 0), (STEM, 0), (STEM, CAP - BAR), (w, CAP - BAR), (w, CAP), (CUT, CAP),
             (0, CAP - CUT)]]


def glyph_d(w):
    big = CUT + 3
    inner = big - 3
    return [[(0, 0), (w - big, 0), (w, big), (w, CAP - big), (w - big, CAP), (0, CAP)],
            [(STEM, BAR), (w - STEM - inner, BAR), (w - STEM, BAR + inner), (w - STEM, CAP - BAR - inner),
             (w - STEM - inner, CAP - BAR), (STEM, CAP - BAR)]]


def glyph_u(w):
    return [[(0, 0), (STEM, 0), (STEM, CAP - BAR), (w - STEM, CAP - BAR), (w - STEM, 0), (w, 0),
             (w, CAP - CUT), (w - CUT, CAP), (CUT, CAP), (0, CAP - CUT)]]


GLYPHS = {'S': (glyph_s, 21), 'T': (glyph_t, 21), 'E': (glyph_e, 19), 'L': (glyph_l, 18),
          'D': (glyph_d, 22), 'U': (glyph_u, 21)}


def word_mask(word):
    pieces = []
    for letter in word:
        build, width = GLYPHS[letter]
        pieces.append(rasterize(build(width), width, CAP))
    return join(pieces, TRACKING)


def join(pieces, gap):
    height = max(piece.shape[0] for piece in pieces)
    width = sum(piece.shape[1] for piece in pieces) + gap * (len(pieces) - 1)
    out = np.zeros((height, width), bool)
    x = 0
    for piece in pieces:
        out[height - piece.shape[0]:, x:x + piece.shape[1]] = piece
        x += piece.shape[1] + gap
    return out


def slant(mask):
    height, width = mask.shape
    extra = (height - 1) // SLANT_EVERY
    out = np.zeros((height, width + extra), bool)
    for y in range(height):
        shift = (height - 1 - y) // SLANT_EVERY
        out[y, shift:shift + width] = mask[y]
    return out


def art_mask(rows, cell='#'):
    return np.array([[char == cell for char in row] for row in rows])


class Canvas:
    def __init__(self, width, height):
        self.rgba = np.zeros((height, width, 4), np.uint8)
        self.shape = (height, width)

    def place(self, mask, x, y):
        out = np.zeros(self.shape, bool)
        h, w = mask.shape
        out[y:y + h, x:x + w] = mask
        return out

    def paint(self, mask, color):
        self.rgba[mask] = (*hex_rgb(color), 255)

    def paint_rows(self, mask, colors, top, dither=False):
        checker = (np.indices(self.shape).sum(axis=0) % 2).astype(bool)
        for row, color in enumerate(colors):
            band = np.zeros(self.shape, bool)
            band[top + row] = mask[top + row]
            self.paint(band, color)
            following = colors[row + 1] if row + 1 < len(colors) else color
            if dither and following != color:
                self.paint(band & checker, following)

    def image(self):
        image = Image.fromarray(self.rgba, 'RGBA')
        return image.crop(image.getbbox())


def moved(mask, dx, dy):
    return np.roll(np.roll(mask, dy, axis=0), dx, axis=1)


def grow(mask):
    return mask | moved(mask, 1, 0) | moved(mask, -1, 0) | moved(mask, 0, 1) | moved(mask, 0, -1)


def edges(mask):
    return {
        'top': mask & ~moved(mask, 0, 1),
        'left': mask & ~moved(mask, 1, 0),
        'bottom': mask & ~moved(mask, 0, -1),
        'right': mask & ~moved(mask, -1, 0),
    }


def draw_word(canvas, face, top, *, colors, depth, edge_colors, dither=False):
    body = face.copy()
    for step in range(1, len(depth) + 1):
        body |= moved(face, 0, step)
    canvas.paint(grow(body), OUTLINE)
    for step in range(len(depth), 0, -1):
        canvas.paint(moved(face, 0, step), depth[step - 1])
    canvas.paint_rows(face, colors, top, dither)
    sides = edges(face)
    canvas.paint(sides['bottom'] | sides['right'], edge_colors['shade'])
    canvas.paint(sides['top'] | sides['left'], edge_colors['light'])


def add_grit(canvas, face, top):
    rng = np.random.default_rng(7)
    inner = face & ~grow(~face)
    inner[:top + 4] = False
    speckle = inner & (rng.random(face.shape) < GRIT_SHARE)
    speckle &= ~(moved(speckle, 1, 0) | moved(speckle, 0, 1) | moved(speckle, 1, 1) | moved(speckle, -1, 1))
    bands = list(dict.fromkeys(SAND))
    for light, dark in zip(bands[1:], bands[2:]):
        colored = np.all(canvas.rgba[..., :3] == hex_rgb(light), axis=-1)
        canvas.paint(speckle & colored, dark)


def draw_art(canvas, rows, x, y, palette):
    for key, color in palette.items():
        canvas.paint(canvas.place(art_mask(rows, key), x, y), color)


def blade_rows(length):
    rows = []
    tip = len(BLADE_ROWS) // 2
    for index, key in enumerate(BLADE_ROWS):
        taper = abs(index - tip)
        row = key * (length - taper * 2) + '.' * (taper * 2)
        if index == FULLER_ROW:
            fuller = int(length * FULLER_SHARE)
            row = 'd' * fuller + row[fuller:]
        rows.append(row)
    return rows


def sword_shape(canvas, rows, at):
    shape = np.zeros(canvas.shape, bool)
    for key in SWORD_COLORS:
        shape |= canvas.place(art_mask(rows, key), *at)
    return shape


def draw_blade(canvas, x, center, length):
    blade = blade_rows(length)
    at = (x, center - len(blade) // 2)
    shape = sword_shape(canvas, blade, at)
    canvas.paint(grow(shape) & ~shape, OUTLINE)
    draw_art(canvas, blade, *at, SWORD_COLORS)
    return x + length


def draw_hilt(canvas, x, center):
    grip_at = (x, center - len(GRIP) // 2)
    guard_at = (x + len(GRIP[0]), center - len(GUARD) // 2)
    shape = sword_shape(canvas, GRIP, grip_at) | sword_shape(canvas, GUARD, guard_at)
    canvas.paint(grow(shape) & ~shape, OUTLINE)
    draw_art(canvas, GRIP, *grip_at, SWORD_COLORS)
    draw_art(canvas, GUARD, *guard_at, SWORD_COLORS)


def disc(shape, cx, cy, radius):
    ys, xs = np.mgrid[0:shape[0], 0:shape[1]] + 0.5
    return (xs - cx) ** 2 + (ys - cy) ** 2 <= radius ** 2


# each lobe is lit on the rim its own disc moved down-right would leave, shaded on the other one
def draw_puffs(canvas, x, baseline):
    lobes = []
    for dx, dy, radius in PUFFS:
        cx, cy, rim = x + dx, baseline + dy, max(1.0, radius * 0.4)
        lobe = disc(canvas.shape, cx, cy, radius)
        lit = lobe & ~disc(canvas.shape, cx + rim, cy + rim, radius)
        shaded = lobe & ~disc(canvas.shape, cx - rim, cy - rim, radius)
        lobes.append((lobe, lit, shaded))
    canvas.paint(grow(np.any([lobe for lobe, _, _ in lobes], axis=0)), OUTLINE)
    for lobe, lit, shaded in reversed(lobes):
        canvas.paint(lobe, PUFF_COLORS['base'])
        canvas.paint(shaded, PUFF_COLORS['dark'])
        canvas.paint(lit, PUFF_COLORS['light'])


def compose():
    steel = slant(word_mask('STEEL'))
    dust = slant(word_mask('DUST'))
    amp = slant(art_mask(AMPERSAND))
    width = steel.shape[1] + MARGIN * 2
    height = CAP * 2 + LINE_GAP + MARGIN * 2
    canvas = Canvas(width, height)
    steel_top, dust_top = MARGIN, MARGIN + CAP + LINE_GAP
    dust_x = MARGIN + steel.shape[1] - dust.shape[1] + DUST_OVERHANG
    amp_x = dust_x - amp.shape[1] - AMP_GAP
    amp_top = dust_top + CAP - amp.shape[0]
    blade_center = steel_top + CAP + LINE_GAP // 2 + 1
    hilt_x = MARGIN - len(GRIP[0]) - len(GUARD[0]) + 4
    blade_x = hilt_x + len(GRIP[0]) + len(GUARD[0]) // 2
    # the blade goes down first so it passes behind the words, the hilt last so it lies over them
    tip = draw_blade(canvas, blade_x, blade_center, MARGIN + steel.shape[1] + TIP_REACH - blade_x)
    draw_word(canvas, canvas.place(steel, MARGIN, steel_top), steel_top, colors=CHROME,
              depth=CHROME_DEPTH, edge_colors=CHROME_EDGES)
    draw_puffs(canvas, amp_x, dust_top + CAP + 2)
    dust_face = canvas.place(dust, dust_x, dust_top)
    draw_word(canvas, dust_face, dust_top, colors=SAND, depth=SAND_DEPTH, edge_colors=SAND_EDGES,
              dither=True)
    add_grit(canvas, dust_face, dust_top)
    draw_word(canvas, canvas.place(amp, amp_x, amp_top), amp_top, colors=resample(SAND, amp.shape[0]),
              depth=SAND_DEPTH[:2], edge_colors=SAND_EDGES, dither=True)
    draw_hilt(canvas, hilt_x, blade_center)
    draw_art(canvas, GLINT, tip - 6, blade_center - len(GLINT) // 2, GLINT_COLORS)
    draw_art(canvas, GLINT, MARGIN + 5, steel_top - 3, GLINT_COLORS)
    return canvas.image()


def main():
    repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    default_dir = os.path.join(repo, 'apps', 'web', 'games', 'steel-and-dust', 'assets', 'ui', 'logo')
    out_dir = sys.argv[1] if len(sys.argv) > 1 else default_dir
    os.makedirs(out_dir, exist_ok=True)
    image = compose()
    image.save(os.path.join(out_dir, 'logo.png'), optimize=True)
    print(f'logo.png {image.width}x{image.height}')


if __name__ == '__main__':
    main()
