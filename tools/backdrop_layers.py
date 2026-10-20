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
    python3 tools/backdrop_layers.py groundhaze <in> <out> <#rrggbb> <amount> <from_y> <to_y>
        pulls a near strip toward the mist more and more from from_y down to to_y (and on below),
        a ground mist that keeps the trunks' feet from swallowing the fighters in front of them
    python3 tools/backdrop_layers.py vary <in> <out> <from_x> <to_x> <above_y>
        joins a near strip with a copy of itself that leaves out what stands between from_x and
        to_x above row above_y (a trunk, a clump), so the trunks do not pass at one even rhythm
    python3 tools/backdrop_layers.py near <out> <base_y> <haze #rrggbb> <amount> <in>...
        rolls each transparent near painting so its widest see-through gap sits on its edges,
        drops its lowest solid row to base_y, joins them side by side and hazes them toward the
        mist colour so the trunks do not swallow the fighters
    python3 tools/backdrop_layers.py unblend <in> <out> [width=64]
        undoes the dithered crossfade `overlap` left on the plate's first `width` columns: sorts
        each pixel back to the end it came from, fills the gaps from its neighbours and joins
        the two ends along the seam where they look most alike, so no ghost of either shows
    python3 tools/backdrop_layers.py join <in> <out> <x> [overlap=32]
        hides a hard vertical cut at column x by laying the two sides `overlap` columns over each
        other and switching from one to the other along the seam where they look most alike
        (the plate gets `overlap` columns narrower)
    python3 tools/backdrop_layers.py cliff <in> <out> <ground.png> [left=0] [width=12] [skip=14] [depth=64] [turf=10] [lip=4] [shade=0.8]
        turns a cliff-face painting into the face of a step whose high ground is on the left:
        drops its white sky rows, keeps `width` columns from `left`, repaints it in the colours
        of the forest's ground cross-section `skip` to `skip + depth` rows under its surface
        (matched by brightness, then darkened to `shade` of the way down the ramp), crumbles its
        right edge, and leaves its top clear so the road's own turf shows above it, `turf` rows
        deep on the inner side thinning to `lip` rows at the edge; 64 rows tall
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


def groundhaze(src, dst, colour, amount, from_y, to_y):
    im = Image.open(src).convert('RGBA')
    r, g, b = (int(colour[i:i + 2], 16) for i in (1, 3, 5))
    top, bottom, most = int(from_y), int(to_y), float(amount)
    px = im.load()
    for y in range(top, im.height):
        weight = most * min(1, (y - top) / max(1, bottom - top))
        for x in range(im.width):
            pr, pg, pb, pa = px[x, y]
            if pa:
                px[x, y] = tuple(round(c + (t - c) * weight) for c, t in ((pr, r), (pg, g), (pb, b))) + (pa,)
    im.save(dst)


def vary(src, dst, from_x, to_x, above_y):
    im = Image.open(src).convert('RGBA')
    copy = im.copy()
    for y in range(int(above_y)):
        for x in range(int(from_x), int(to_x)):
            copy.putpixel((x, y), (0, 0, 0, 0))
    out = Image.new('RGBA', (im.width * 2, im.height))
    out.paste(im, (0, 0))
    out.paste(copy, (im.width, 0))
    out.save(dst)


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


def colour_distance(a, b):
    return sum((p - q) ** 2 for p, q in zip(a[:3], b[:3]))


def least_visible_seam(left, right, lo, hi):
    # one switch column per row, moving at most a column from row to row, through the pixels
    # where the two pictures differ least
    h = left.height
    cost = [[colour_distance(left.getpixel((x, y)), right.getpixel((x, y))) for x in range(lo, hi)] for y in range(h)]
    span = hi - lo
    total = [cost[0][:]]
    for y in range(1, h):
        prev = total[-1]
        total.append([cost[y][i] + min(prev[max(0, i - 1):min(span, i + 2)]) for i in range(span)])
    path = [min(range(span), key=lambda i: total[-1][i])]
    for y in range(h - 2, -1, -1):
        i = path[-1]
        options = range(max(0, i - 1), min(span, i + 2))
        path.append(min(options, key=lambda j: total[y][j]))
    return [lo + i for i in reversed(path)]


def fill_gaps(im, known):
    # each unknown pixel takes the nearest known one of the same picture, along its row first
    out = im.copy()
    for y in range(im.height):
        for x in range(im.width):
            if known[y][x]:
                continue
            for reach in range(1, im.width):
                spots = [(x - reach, y), (x + reach, y), (x, y - reach), (x, y + reach)]
                found = [p for p in spots if 0 <= p[0] < im.width and 0 <= p[1] < im.height and known[p[1]][p[0]]]
                if found:
                    out.putpixel((x, y), im.getpixel(found[0]))
                    break
    return out


def unblend(src, dst, width='64'):
    im = Image.open(src).convert('RGBA')
    k = int(width)
    zone = im.crop((0, 0, k, im.height))
    keep = [[(x + 0.5) / k > (BAYER[y % 4][x % 4] + 0.5) / 16 for x in range(k)] for y in range(im.height)]
    start = fill_gaps(zone, keep)
    end = fill_gaps(zone, [[not v for v in row] for row in keep])
    path = least_visible_seam(end, start, k // 4, 3 * k // 4)
    for y, cut in enumerate(path):
        for x in range(k):
            im.putpixel((x, y), (end if x < cut else start).getpixel((x, y)))
    im.save(dst)


def join(src, dst, at, overlap='32'):
    im = Image.open(src).convert('RGBA')
    c, k = int(at), int(overlap)
    left = im.crop((c - k, 0, c, im.height))
    right = im.crop((c, 0, c + k, im.height))
    path = least_visible_seam(left, right, 0, k)
    out = Image.new('RGBA', (im.width - k, im.height))
    out.paste(im.crop((0, 0, c - k, im.height)), (0, 0))
    out.paste(im.crop((c + k, 0, im.width, im.height)), (c, 0))
    for y, cut in enumerate(path):
        for x in range(k):
            out.putpixel((c - k + x, y), (left if x < cut else right).getpixel((x, y)))
    out.save(dst)


CLIFF_HEIGHT = 64


def brightness(colour):
    r, g, b = colour[:3]
    return 0.299 * r + 0.587 * g + 0.114 * b


def surface_row(im):
    alpha = im.getchannel('A')
    return next(y for y in range(im.height) if sum(alpha.getpixel((x, y)) == 0 for x in range(im.width)) < im.width // 4)


def earth_colours(ground_path, skip, rows):
    im = Image.open(ground_path).convert('RGBA')
    # the face is the earth under the turf (or, for a paved road, the stones of the paving)
    start = surface_row(im) + skip
    end = min(im.height, start + rows)
    pixels = [im.getpixel((x, y)) for y in range(start, end) for x in range(im.width)]
    return sorted((p for p in pixels if p[3] == 255), key=brightness)


def match_brightness(im, palette):
    # each pixel takes the earth colour at the same brightness rank, so the face keeps its light
    # and shade but in the forest's own colours
    pixels = [(x, y) for y in range(im.height) for x in range(im.width) if im.getpixel((x, y))[3]]
    ranked = sorted(pixels, key=lambda xy: brightness(im.getpixel(xy)))
    out = im.copy()
    for rank, xy in enumerate(ranked):
        out.putpixel(xy, palette[rank * (len(palette) - 1) // max(1, len(ranked) - 1)])
    return out


def crumble(im, darkest):
    # the outer edge wanders in and out by a pixel or two every few rows, but light pixels
    # (stones, roots) on it stay and jut out; the new edge gets the art's dark outline
    w = im.width
    cut, run = 1, 0
    for y in range(im.height):
        if run == 0:
            cut = (cut + (1, -1, 1, 0, -1)[y % 5]) % 3
            run = 2 + (y * 5) % 4
        run -= 1
        here = cut
        while here and brightness(im.getpixel((w - here, y))) > brightness(darkest) + 90:
            here -= 1
        for x in range(w - here, w):
            im.putpixel((x, y), (0, 0, 0, 0))
        im.putpixel((w - here - 1, y), darkest)
    return im


TURF_EDGE = [0, 1, 0, -1, 0, 1, 1, 0, -1, 0, 1, 0]


def face_start(x, width, turf, lip):
    # the road's turf keeps its full depth on the inner side and thins to `lip` rows at the edge,
    # so it rounds over the shoulder of the step
    reach = (x / (width - 1)) ** 1.5
    return max(1, round(turf - (turf - lip) * reach) + TURF_EDGE[x % len(TURF_EDGE)])


def shade_ranks(im, palette, amount):
    # the face is turned away from the light, so every pixel steps down the earth's ramp, but
    # never to the very darkest, which is kept for its outline
    index = {colour: i for i, colour in enumerate(palette)}
    lowest = len(palette) // 8
    for y in range(im.height):
        for x in range(im.width):
            colour = im.getpixel((x, y))
            if colour[3] and colour in index:
                im.putpixel((x, y), palette[max(lowest, int(index[colour] * amount))])
    return im


def cliff(src, dst, ground_path, left='0', width='12', skip='14', depth='64', turf='10', lip='4', shade='0.8'):
    im = Image.open(src).convert('RGBA')
    rows = [y for y in range(im.height) if not is_white([im.getpixel((x, y)) for x in range(im.width)])]
    left, width, turf, lip = int(left), int(width), int(turf), int(lip)
    face = im.crop((left, rows[0] + 1, left + width, rows[-1] + 1))
    palette = earth_colours(ground_path, int(skip), int(depth))
    face = shade_ranks(match_brightness(face, palette), palette, float(shade))
    face = crumble(face, palette[0])
    out = Image.new('RGBA', (width, CLIFF_HEIGHT))
    for x in range(width):
        column = face.crop((x, 0, x + 1, face.height))
        top = face_start(x, width, turf, lip)
        out.paste(column, (x, top))
        for y in range(top + face.height, CLIFF_HEIGHT):
            out.putpixel((x, y), face.getpixel((x, face.height - 1)))
    out.save(dst)


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
        'groundhaze': groundhaze,
        'vary': vary,
        'cliff': cliff,
        'unblend': unblend,
        'join': join,
    }[
        command
    ](*args)
