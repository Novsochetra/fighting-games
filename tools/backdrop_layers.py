"""Turn PixelLab paintings into the sideways-tiling layers of a painted forest.

    python3 tools/backdrop_layers.py unframe <in> <out>
        trims the white frame Pro sometimes paints around a scene and pads back to 216 rows
    python3 tools/backdrop_layers.py shift <in> <out> <x>
        rolls the plate so column x becomes column 0 (keeps a sun or moon out of the join)
    python3 tools/backdrop_layers.py overlap <in> <out> [width=64]
        overlaps the plate's two ends with an ordered-dither crossfade, so it tiles; every pixel
        stays one of the plate's own colours
    python3 tools/backdrop_layers.py fogfloor <in> <out> <from_y>
        flattens the rows just above the road into plain bands, hiding any step left there
    python3 tools/backdrop_layers.py ground <in> <out>
        keys out the flat colour above a ground cross-section (the grass tips stay), dithers its
        ends together so it tiles, and prints the row the road's surface sits on
    python3 tools/backdrop_layers.py sink <in> <out> <rows>
        moves a near strip down so a ground band painted at its base hides under the road,
        repeating its top row so trunks still reach the top of the view
    python3 tools/backdrop_layers.py haze <in> <out> <#rrggbb> <amount>
        pulls a near strip further toward the forest's mist, so dark trunks sit back from the fight
    python3 tools/backdrop_layers.py near <out> <base_y> <haze #rrggbb> <amount> <in>...
        rolls each transparent near painting so its widest see-through gap sits on its edges,
        drops its lowest solid row to base_y, joins them side by side and hazes them toward the
        mist colour so the trunks do not swallow the fighters
"""
import sys
from collections import Counter
from PIL import Image

BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
HEIGHT = 216


def is_white(pixels):
    return all(min(p[:3]) > 245 for p in pixels)


def unframe(src, dst):
    im = Image.open(src).convert('RGBA')
    w, h = im.size
    rows = [y for y in range(h) if not is_white([im.getpixel((x, y)) for x in range(w)])]
    # a frame column is only partly white where the painting runs into it, so any column that is
    # mostly white counts as frame
    cols = [x for x in range(w) if sum(min(im.getpixel((x, y))[:3]) > 245 for y in range(h)) < h // 3]
    inner = im.crop((cols[0], rows[0], cols[-1] + 1, rows[-1] + 1))
    out = Image.new('RGBA', (inner.width, HEIGHT))
    top = rows[0]
    out.paste(inner, (0, top))
    for y in range(top):
        out.paste(inner.crop((0, 0, inner.width, 1)), (0, y))
    for y in range(top + inner.height, HEIGHT):
        out.paste(inner.crop((0, inner.height - 1, inner.width, inner.height)), (0, y))
    out.save(dst)


def roll(im, x0):
    x0 %= im.width
    out = Image.new(im.mode, im.size)
    out.paste(im.crop((x0, 0, im.width, im.height)), (0, 0))
    out.paste(im.crop((0, 0, x0, im.height)), (im.width - x0, 0))
    return out


def shift(src, dst, x):
    roll(Image.open(src), int(x)).save(dst)


def overlap(src, dst, width='64'):
    im = Image.open(src).convert('RGBA')
    k = int(width)
    tile = im.width - k
    out = im.crop((0, 0, tile, im.height))
    for x in range(k):
        weight = (x + 0.5) / k
        for y in range(im.height):
            keep = weight > (BAYER[y % 4][x % 4] + 0.5) / 16
            out.putpixel((x, y), im.getpixel((x, y) if keep else (tile + x, y)))
    out.save(dst)


def fogfloor(src, dst, from_y):
    im = Image.open(src).convert('RGBA')
    for y in range(int(from_y), im.height):
        colour = Counter(im.getpixel((x, y)) for x in range(im.width)).most_common(1)[0][0]
        for x in range(im.width):
            im.putpixel((x, y), colour)
    im.save(dst)


def ground(src, dst):
    im = Image.open(src).convert('RGBA')
    key = im.getpixel((0, 0))
    for y in range(16):
        for x in range(im.width):
            if im.getpixel((x, y)) == key:
                im.putpixel((x, y), (0, 0, 0, 0))
    alpha = im.getchannel('A')
    top = next(y for y in range(im.height) if sum(alpha.getpixel((x, y)) == 0 for x in range(im.width)) < im.width // 4)
    im.save(dst)
    overlap(dst, dst, '32')
    print(src, 'surface row', top)


def sink(src, dst, rows):
    im = Image.open(src).convert('RGBA')
    dy = int(rows)
    out = Image.new('RGBA', im.size)
    out.paste(im.crop((0, 0, im.width, im.height - dy)), (0, dy))
    for y in range(dy):
        out.paste(im.crop((0, 0, im.width, 1)), (0, y))
    out.save(dst)


def haze_file(src, dst, colour, amount):
    haze(Image.open(src).convert('RGBA'), colour, float(amount)).save(dst)


def widest_gap_centre(im):
    alpha = im.getchannel('A')
    clear = [all(alpha.getpixel((x, y)) < 16 for y in range(im.height)) for x in range(im.width)]
    best, start = (0, None), None
    for x, is_clear in enumerate(clear + [False]):
        if is_clear and start is None:
            start = x
        elif not is_clear and start is not None:
            best = max(best, (x - start, (start + x) // 2))
            start = None
    return best[1]


def lowest_solid_row(im):
    alpha = im.getchannel('A')
    for y in range(im.height - 1, -1, -1):
        if sum(alpha.getpixel((x, y)) > 128 for x in range(im.width)) > 6:
            return y
    return im.height - 1


def haze(im, colour, amount):
    r, g, b = (int(colour[i:i + 2], 16) for i in (1, 3, 5))
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            pr, pg, pb, pa = px[x, y]
            if pa:
                px[x, y] = tuple(round(c + (t - c) * amount) for c, t in ((pr, r), (pg, g), (pb, b))) + (pa,)
    return im


def near(dst, base_y, colour, amount, *paths):
    parts = []
    for path in paths:
        im = Image.open(path).convert('RGBA')
        centre = widest_gap_centre(im)
        im = roll(im, centre) if centre is not None else im
        placed = Image.new('RGBA', im.size)
        placed.paste(im, (0, int(base_y) - lowest_solid_row(im)), im)
        parts.append(placed)
    strip = Image.new('RGBA', (sum(p.width for p in parts), HEIGHT))
    for i, part in enumerate(parts):
        strip.paste(part, (sum(p.width for p in parts[:i]), 0))
    haze(strip, colour, float(amount)).save(dst)


if __name__ == '__main__':
    command, *args = sys.argv[1:]
    {
        'unframe': unframe,
        'shift': shift,
        'overlap': overlap,
        'fogfloor': fogfloor,
        'ground': ground,
        'sink': sink,
        'haze': haze_file,
        'near': near,
    }[
        command
    ](*args)
