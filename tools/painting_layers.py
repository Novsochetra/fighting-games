"""Turn full-size paintings (ChatGPT, 1536x1024) into the pixel layers of a painted road.

    python3 tools/painting_layers.py plate <in> <out> <top> <bottom> <width> <colours>
        crops rows top to bottom of a scene, scales it to width x 216 and reduces it to `colours`
        flat colours, so the painting's soft gradients become pixel art at the road's own size
    python3 tools/painting_layers.py key <in> <out> <scale>
        keys out the flat magenta behind a sheet of props or a cross-section, takes the magenta
        back out of their edges, scales the sheet by `scale` with hard edges, and turns what is
        left of the magenta spill (thin leaves that were painted half see-through) warm
    python3 tools/painting_layers.py pieces <in> <prefix>
        cuts a keyed sheet into one file per prop (<prefix>-0.png, <prefix>-1.png ...), left to
        right along each row; stray specks join the prop whose box they sit in
    python3 tools/painting_layers.py tile <in> <out> <colours> <min_width>
        trims a keyed cross-section to its painted rows, cuts it between the two columns at least
        min_width apart that match best so it tiles, reduces it, flattens its last row to one
        colour (it runs on down under a high hill) and prints its first full row
    python3 tools/painting_layers.py course <ground> <out> <from_row> <to_row> <width> [shade=0.8]
        a run of the ground's rows from_row to to_row, `width` wide, its two ends darkened as
        faces turned from the light: the plinth a balustrade stands on
    python3 tools/painting_layers.py place <out> <width> <base_y> <haze #rrggbb> <amount> <colours> <piece>[:x[:m][:lift]]...
        lays pieces on a transparent strip, each one's lowest row on base_y minus lift (m mirrors
        it; one laid past the strip's right end runs on at its left, as the strip tiles), hazes the
        strip toward the road's air and reduces it to `colours`
    python3 tools/painting_layers.py face <ground> <out> <surface_row> <x> [width=12] [shade=0.75]
        the face of a step whose high ground is on the left, from the ground's own columns under
        its surface: darkened as a face turned from the light, the lip lit and the outer edge
        its own dirt, not an outline; 64 rows tall, the last row run on down
"""
import sys
from PIL import Image, ImageOps

HEIGHT = 216
CLIFF_HEIGHT = 64
KEY = (249, 2, 249)
# how far a pixel's red and blue stand above its green: the flat key sits near 245, painted
# colours below 60; between the two a pixel is part key, part paint
KEY_SOLID, KEY_CLEAR = 60, 150
SPECK = 40


def pixels(im):
    # Pillow 12.3 renamed getdata; older Pillows only have the old name
    return getattr(im, 'get_flattened_data', im.getdata)()


def reduce(im, colours):
    alpha = im.getchannel('A') if im.mode == 'RGBA' else None
    flat = im.convert('RGB').quantize(colors=int(colours), method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    if alpha is None:
        return flat.convert('RGB')
    out = flat.convert('RGBA')
    out.putalpha(alpha)
    return out


def plate(src, dst, top, bottom, width, colours):
    im = Image.open(src).convert('RGB')
    band = im.crop((0, int(top), im.width, int(bottom)))
    reduce(band.resize((int(width), HEIGHT), Image.LANCZOS), colours).save(dst)


def unmix(r, g, b):
    share = max(0.0, min(1.0, (KEY_CLEAR - (min(r, b) - g)) / (KEY_CLEAR - KEY_SOLID)))
    if share <= 0.05:
        return (0, 0, 0, 0)
    paint = tuple(max(0, min(255, round((c - (1 - share) * k) / share))) for c, k in zip((r, g, b), KEY))
    return paint + (round(share * 255),)


def warm_spill(r, g, b):
    if min(r, b) - g > 20:
        return (min(r, round(g * 1.6)), g, min(b, round(g * 0.6)))
    return (r, g, b)


def key(src, dst, scale):
    im = Image.open(src).convert('RGB')
    keyed = Image.new('RGBA', im.size)
    keyed.putdata([unmix(*pixel) for pixel in pixels(im)])
    size = (round(im.width * float(scale)), round(im.height * float(scale)))
    small = keyed.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')
    small.putdata([warm_spill(r, g, b) + (255,) if a >= 128 else (0, 0, 0, 0) for r, g, b, a in pixels(small)])
    small.save(dst)


def solid_parts(im):
    px = im.load()
    seen = set()
    parts = []
    for y0 in range(im.height):
        for x0 in range(im.width):
            if (x0, y0) in seen or not px[x0, y0][3]:
                continue
            seen.add((x0, y0))
            stack, pixels = [(x0, y0)], []
            while stack:
                x, y = stack.pop()
                pixels.append((x, y))
                for nx in (x - 1, x, x + 1):
                    for ny in (y - 1, y, y + 1):
                        inside = 0 <= nx < im.width and 0 <= ny < im.height
                        if inside and (nx, ny) not in seen and px[nx, ny][3]:
                            seen.add((nx, ny))
                            stack.append((nx, ny))
            parts.append(pixels)
    return parts


def box_of(pixels):
    xs, ys = [x for x, _ in pixels], [y for _, y in pixels]
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def pieces(src, prefix):
    im = Image.open(src).convert('RGBA')
    parts = solid_parts(im)
    props = [p for p in parts if len(p) >= SPECK]
    boxes = [box_of(p) for p in props]
    for speck in (p for p in parts if len(p) < SPECK):
        x, y = speck[0]
        for prop, (x0, y0, x1, y1) in zip(props, boxes):
            if x0 - 2 <= x <= x1 + 2 and y0 - 2 <= y <= y1 + 2:
                prop.extend(speck)
                break
    rows = sorted(props, key=lambda p: (box_of(p)[3] > im.height // 2, box_of(p)[0]))
    for i, prop in enumerate(rows):
        x0, y0, x1, y1 = box_of(prop)
        piece = Image.new('RGBA', (x1 - x0, y1 - y0))
        for x, y in prop:
            piece.putpixel((x - x0, y - y0), im.getpixel((x, y)))
        piece.save(f'{prefix}-{i}.png')
        print(f'{prefix}-{i}.png', piece.size)


def column_cost(px, height, xa, xb):
    cost = 0
    for x0, x1, weight in ((xa, xb, 1), (xa - 1, xb - 1, 0.5)):
        for y in range(height):
            p, q = px[x0, y], px[x1, y]
            cost += 30000 if p[3] != q[3] else weight * sum((p[i] - q[i]) ** 2 for i in range(3))
    return cost


# the road runs its cross-section's last row on down under a high hill, so a speckled last row
# would draw stripes; one plain colour reads as deep earth
def flatten_last_row(im):
    y = im.height - 1
    row = [im.getpixel((x, y)) for x in range(im.width)]
    plain = max(set(row), key=row.count)
    for x in range(im.width):
        im.putpixel((x, y), plain)


def tile(src, dst, colours, min_width):
    im = Image.open(src).convert('RGBA')
    _, top, _, bottom = im.getchannel('A').getbbox()
    im = im.crop((0, top, im.width, bottom))
    px = im.load()
    pairs = ((xa, xb) for xa in range(1, im.width - int(min_width)) for xb in range(xa + int(min_width), im.width))
    xa, xb = min(pairs, key=lambda pair: column_cost(px, im.height, *pair))
    out = reduce(im.crop((xa, 0, xb, im.height)), colours)
    flatten_last_row(out)
    out.save(dst)
    alpha = out.getchannel('A')
    first_full = next(y for y in range(out.height) if all(alpha.getpixel((x, y)) for x in range(out.width)))
    print(dst, out.size, 'columns', xa, xb, 'first full row', first_full)


def darken(colour, amount):
    return tuple(round(c * amount) for c in colour[:3]) + (colour[3],)


def course(ground, dst, from_row, to_row, width, shade='0.8'):
    im = Image.open(ground).convert('RGBA')
    rows = im.crop((0, int(from_row), im.width, int(to_row) + 1))
    out = Image.new('RGBA', (int(width), rows.height))
    for x in range(0, out.width, rows.width):
        out.paste(rows, (x, 0))
    px = out.load()
    for x in (0, out.width - 1):
        for y in range(out.height):
            px[x, y] = darken(px[x, y], float(shade))
    out.save(dst)


def place(dst, width, base_y, colour, amount, colours, *specs):
    strip = Image.new('RGBA', (int(width), HEIGHT))
    for spec in specs:
        path, x, *flags = spec.split(':')
        piece = Image.open(path).convert('RGBA')
        piece = ImageOps.mirror(piece) if 'm' in flags else piece
        lift = next((int(flag) for flag in flags if flag.isdigit()), 0)
        top = int(base_y) - lift + 1 - piece.height
        # the strip tiles, so a piece laid past its right end runs on at its left
        left = int(x) % int(width)
        strip.alpha_composite(piece, (left, top))
        if left + piece.width > int(width):
            strip.alpha_composite(piece, (0, top), (int(width) - left, 0))
    tint = tuple(int(colour[i:i + 2], 16) for i in (1, 3, 5))
    share = float(amount)
    strip.putdata([
        tuple(round(c + (t - c) * share) for c, t in zip((r, g, b), tint)) + (255,) if a else (0, 0, 0, 0)
        for r, g, b, a in pixels(strip)
    ])
    reduce(strip, colours).save(dst)


def face(ground, dst, surface_row, x, width='12', shade='0.75'):
    im = Image.open(ground).convert('RGBA')
    width, top = int(width), int(surface_row)
    rows = im.crop((int(x), top, int(x) + width, im.height))
    out = Image.new('RGBA', (width, CLIFF_HEIGHT))
    out.paste(rows, (0, 0))
    last = rows.crop((0, rows.height - 1, width, rows.height))
    for y in range(rows.height, CLIFF_HEIGHT):
        out.paste(last, (0, y))
    px = out.load()
    # the edge is the dirt beside it, not the ground's darkest colour: a black line down a face
    # reads as a drawn outline wherever it meets the sky or water, and the rest of the road has none
    for y in range(CLIFF_HEIGHT):
        for i in range(width - 1):
            px[i, y] = darken(px[i, y], float(shade)) if y else px[i, y]
        px[width - 1, y] = px[width - 2, y]
    out.save(dst)


if __name__ == '__main__':
    command, *args = sys.argv[1:]
    {
        'plate': plate,
        'key': key,
        'pieces': pieces,
        'tile': tile,
        'course': course,
        'place': place,
        'face': face,
    }[command](*args)
