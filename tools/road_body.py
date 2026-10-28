"""Paint the body of a raised painted road: what lies under its paving, laid level along the world's
rows instead of following each step, so a raised step stands on the same courses and earth as the
road beside it, and the faces where a step or a breach cuts through it.

    python3 tools/road_body.py courses <ground.png> <folder> <surface_row> <course_from> <course_to> <earth_from>
        a road built of courses (Angkor Wat). Writes <folder>/deep.png: the road's own course
        (ground rows course_from to course_to, its mortar line first) stacked level up to the
        highest step, each course shifted along from the one under it so no joint stands over
        another, worn quieter than the road's own, a few of its blocks fallen out and strangler-fig
        roots crawling down it, the ground's own rows from course_from down under it, and all of it
        darkening into the earth; <folder>/face.png: four sets of the ends of those courses where a
        step cuts through them, each end jutting out, flush or fallen back; <folder>/breach.png: the
        two broken banks of a breach, drawn by hand; <folder>/cliff.png: the end of the paving at a
        step's lip, with creepers hanging off it
    python3 tools/road_body.py earth <ground.png> <out> <surface_row> <from_row> <band_rows>
        a road on earth (the Bayon, and the forests, camp, canyon, works and fortress whose
        cross-sections run out under their high ground): the cross-section's own rows from
        from_row down where the road shows them, and its band of earth from from_row repeated
        upward under the raised ground, shifted along each time and every other one upside down
"""
import random
import sys
from PIL import Image

HEIGHT = 216
# the world row the road's base level stands on
GROUND_Y = 184
SEED = 11
COURSE_SHIFTS = [0, 17, 6, 23, 11, 28, 3, 19]
EARTH_SHIFTS = [0, 37, 81, 19, 64, 102, 9, 51]

# Angkor Wat's colours, from its ground.png and its theme (src/art/painted-themes/angkor-wat.js)
MOSS = (92, 77, 54, 255)
ROCK = (79, 44, 60, 255)
GRASS = (112, 132, 56, 255)
STEM = (73, 86, 36, 255)
ROOT, ROOT_SHADE = (140, 111, 61, 255), (92, 77, 54, 255)
FIG_LIT, FIG = (163, 136, 88, 255), (128, 101, 64, 255)
FIG_SHADE, FIG_DARK = (96, 72, 50, 255), (46, 30, 30, 255)
# the dark of the wall's core, seen where a block has fallen out
CAVITY, CAVITY_SHADE = (36, 18, 24, 255), (52, 24, 30, 255)
# a flush end, the block's end turned from the light
FLUSH = (30, 14, 18, 120)
RUBBLE = (88, 65, 53, 255)

# a step's face: how far its edge sits in from the high side, how far it can reach out over the
# low side, and the ends its courses may have, by weight
STEP_FACE = dict(variants=4, inside=5, out=6, roots=3,
                 ends={'jut1': 3, 'jut2': 3, 'jut3': 2, 'jut4': 1, 'flush': 2, 'gone2': 1.5, 'gone3': 1})
# the two banks of a breach broken through the road: each course's end from the road's own (0) up,
# how far the earth below bulges out row by row, and its roots, as (x from the edge, y from the
# earth's top, length)
BREACH = dict(inside=6, out=10)
BREACH_BANKS = [
    {
        'courses': [('gone', 3), ('jut', 6), ('jut', 3), ('jut', 1), ('flush',)],
        'earth': [1, 2, 3, 3, 4, 4, 3, 3, 2, 2, 1],
        'roots': [(-2, -11, 9), (1, -2, 12), (3, 2, 9), (5, 5, 6)],
    },
    {
        'courses': [('jut', 5), ('jut', 2), ('gone', 2), ('flush',), ('jut', 1)],
        'earth': [3, 3, 2, 2, 1, 1, 0, -1, -1, 0, 1],
        'roots': [(1, -2, 11), (4, 0, 8), (0, 3, 7), (2, 6, 5)],
    },
]


def clamp(value):
    return max(0, min(255, round(value)))


def shade(colour, amount):
    return tuple(clamp(c * amount) for c in colour[:3]) + (colour[3],)


def mix(colour, other, share):
    return tuple(clamp(c + (o - c) * share) for c, o in zip(colour[:3], other[:3])) + (colour[3],)


def rows_of(ground, top, from_row, out):
    # the ground's own rows from from_row down, at the world rows the base road lays them on
    for y in range(top + from_row, HEIGHT):
        row = min(y - top, ground.height - 1)
        out.paste(ground.crop((0, row, ground.width, row + 1)), (0, y))


def shifted(band, shift):
    out = Image.new('RGBA', band.size)
    out.paste(band, (shift, 0))
    out.paste(band, (shift - band.width, 0))
    return out


class Layout:
    """Where a road built of courses lays them, in the world's rows."""

    def __init__(self, surface_row, course_from, course_to, earth_from):
        self.top = GROUND_Y - int(surface_row)
        self.course_from, self.course_to = int(course_from), int(course_to)
        self.period = self.course_to - self.course_from
        self.base = self.top + self.course_from
        self.earth_y = self.top + int(earth_from)
        self.earth_from = int(earth_from)

    def course_top(self, k):
        # the first row of course k's blocks, under its mortar line; the road's own course is 0
        return self.base - self.period * k + 1

    def courses(self):
        return range(0, self.base // self.period + 1)


# the wall is lit where it meets the walkway and darkens all the way down into the earth, cooling
# into the dusk, so the bottom of the road settles into shadow under the fight
def shade_by_depth(im):
    px = im.load()
    for y in range(im.height):
        share = max(0.0, min(1.0, (y - 150) / (HEIGHT - 150)))
        for x in range(im.width):
            if px[x, y][3]:
                px[x, y] = mix(shade(px[x, y], 1 - 0.26 * share), ROCK, 0.16 * share)


def joints_of(ground, layout):
    # the mortar between blocks is moss and shadow, far less red than the laterite
    px = ground.load()
    rows = range(layout.course_from + 2, layout.course_to - 1)
    redness = [sum(px[x, y][0] - px[x, y][1] for y in rows) / len(rows) for x in range(ground.width)]
    return [x for x in range(ground.width) if redness[x] < 35]


def blocks_of(width, joints):
    spans, start = [], None
    for x in range(width):
        if x in joints:
            if start is not None:
                spans.append((start, x))
            start = None
        elif start is None:
            start = x
    return spans + ([(start, width)] if start is not None else [])


def fall_out(px, span, rows, rng):
    # a block fallen out of the wall: broken stubs of it left at its ends, and the dark rubble and
    # earth of the core behind, in shadow under the block above, a few stones at its foot
    left, right = span[0] + rng.randint(1, 3), span[1] - rng.randint(1, 3)
    for x in range(left, right):
        ragged = rng.randint(0, 1)
        for y in range(1 + ragged, rows):
            px[x, y] = CAVITY if y < 3 + ragged else (CAVITY_SHADE if rng.random() < 0.85 else ROOT_SHADE)
    for _ in range(rng.randint(1, 3)):
        x = rng.randint(left, right - 2)
        px[x, rows - 1] = ROOT_SHADE
        px[x + 1, rows - 1] = RUBBLE


def weather(course, blocks, rng):
    px = course.load()
    colours = [course.getpixel((x, y)) for x in range(course.width) for y in range(1, course.height)]
    mean = tuple(sum(c[i] for c in colours) // len(colours) for i in range(3)) + (255,)
    for left, right in blocks:
        if right - left >= 10 and rng.random() < 0.09:
            fall_out(px, (left, right), course.height, rng)
            continue
        tone, mossy = rng.uniform(0.82, 1.0), rng.random() < 0.2
        for x in range(left, right):
            for y in range(1, course.height):
                # the wall's courses are quieter than the road's own, worn smooth
                colour = shade(mix(px[x, y], mean, 0.28), tone)
                px[x, y] = mix(colour, MOSS, 0.35) if mossy and y <= 3 + rng.random() * 3 else colour
    # the ledge of the course above shades the top of each block, and its foot is in shadow
    for x in range(course.width):
        px[x, 1] = shade(px[x, 1], 0.86)
        px[x, course.height - 1] = shade(px[x, course.height - 1], 0.82)


def draw_root_row(px, x, y, thickness, width):
    # one row of a root: lit on its left, in shade on its right, outlined on both sides
    for i in range(thickness):
        shaded = i == thickness - 1 and thickness > 2
        px[(x + i) % width, y] = FIG_LIT if i == 0 else (FIG_SHADE if shaded else FIG)
    px[(x - 1) % width, y] = FIG_DARK
    px[(x + thickness) % width, y] = FIG_DARK


def draw_branch(px, start, rng, width, until, way=1):
    x, y = start
    for _ in range(rng.randint(6, 14)):
        if y >= min(until + 6, HEIGHT):
            return
        draw_root_row(px, x, y, 1, width)
        y += 1
        x += way if rng.random() < 0.45 else 0


def draw_fig_root(px, x, rng, width, until):
    # a strangler fig's root crawling down the wall from under the walkway into the earth, thick
    # at the top, tapering, throwing out thinner roots as it goes
    y, thickness = 140, 5
    while y < until:
        draw_root_row(px, x, y, max(1, round(thickness)), width)
        y += 1
        if rng.random() < 0.35:
            x += rng.choice([-1, 1, 1]) if y % 2 else rng.choice([-1, -1, 1])
        thickness = max(2, thickness - 0.05)
        if y > 160 and rng.random() < 0.05:
            draw_branch(px, (x + round(thickness), y), rng, width, until)
        if y > 160 and rng.random() < 0.03:
            draw_branch(px, (x - 2, y), rng, width, until, -1)


def make_deep(ground, layout, rng):
    out = Image.new('RGBA', (ground.width, HEIGHT))
    rows_of(ground, layout.top, layout.course_from, out)
    course = ground.crop((0, layout.course_from, ground.width, layout.course_to))
    joints = joints_of(ground, layout)
    for k in layout.courses():
        if k == 0:
            continue
        shift = COURSE_SHIFTS[k % len(COURSE_SHIFTS)]
        laid = shifted(course, shift)
        weather(laid, blocks_of(ground.width, {(j + shift) % ground.width for j in joints}), rng)
        out.paste(laid, (0, layout.base - layout.period * k))
    draw_fig_root(out.load(), 61, rng, ground.width, layout.earth_y + 4)
    draw_fig_root(out.load(), 172, rng, ground.width, layout.earth_y - 6)
    shade_by_depth(out)
    return out


def draw_jut(px, edge, top, reach, art):
    # the end block juts out over the low side: lit along its top, its end in shade, its outer
    # corners chipped, sometimes cracked across, moss on the ledge it makes
    profile, lit, rng = art
    rows = len(profile)
    chip_top, chip_foot = reach > 1 and rng.random() < 0.5, reach > 1 and rng.random() < 0.4
    for i in range(reach):
        outermost = i == reach - 1
        for row in range(rows):
            if outermost and ((row == 0 and chip_top) or (row == rows - 1 and chip_foot)):
                continue
            colour = shade(profile[row], 0.92 * (0.7 if outermost else 1))
            px[edge + i, top + row] = mix(colour, lit, 0.5) if row == 0 else colour
    if reach >= 3 and rng.random() < 0.6:
        x, y = edge + rng.randint(1, reach - 2), top + rng.randint(2, rows - 3)
        px[x, y] = px[x + 1, y + 1] = CAVITY
    if rng.random() < 0.4:
        for i in range(rng.randint(1, reach)):
            px[edge + i, top] = MOSS


def draw_gone(px, edge, top, depth, rows):
    # the end block has fallen out: the hole it left, darkest under the block above
    for i in range(depth):
        for row in range(rows):
            px[edge - 1 - i, top + row] = CAVITY if row < 2 or i == depth - 1 else CAVITY_SHADE


def draw_end(px, edge, top, end, art):
    kind, *amount = end
    if kind == 'jut':
        draw_jut(px, edge, top, amount[0], art)
    elif kind == 'gone':
        draw_gone(px, edge, top, amount[0], len(art[0]))
    else:
        for row in range(len(art[0])):
            px[edge - 1, top + row] = FLUSH


def draw_root(px, start, length, bounds):
    x, y = start
    for step in range(length):
        if bounds[0] <= x < bounds[1] and 0 <= y < HEIGHT:
            px[x, y] = ROOT if step % 4 else ROOT_SHADE
        y += 1
        x += 1 if step % 3 == 2 else 0


def draw_earth(px, edge, reaches, layout, earth):
    # the earth under the road's own course, eroding out over the gap or back into the bank
    for i, reach in enumerate(reaches):
        y = layout.earth_y + i
        colour = earth[min(i, len(earth) - 1)]
        for j in range(max(reach, 0)):
            px[edge + j, y] = shade(colour, 0.68 if j == reach - 1 else 0.9)
        for j in range(max(-reach, 0)):
            px[edge - 1 - j, y] = CAVITY_SHADE


def profiles(ground, layout):
    # one column down the middle of a block, and down the earth, for the ends drawn on a face
    block = [ground.getpixel((45, y)) for y in range(layout.course_from + 1, layout.course_to)]
    rows = range(layout.earth_from, layout.earth_from + 16)
    earth = [ground.getpixel((150, min(y, ground.height - 1))) for y in rows]
    return block, earth, ground.getpixel((45, GROUND_Y - layout.top))


def make_faces(ground, layout, rng):
    block, earth, lit = profiles(ground, layout)
    spec = STEP_FACE
    width = spec['inside'] + spec['out']
    face = Image.new('RGBA', (width * spec['variants'], HEIGHT))
    px = face.load()
    for v in range(spec['variants']):
        edge = v * width + spec['inside']
        for k in layout.courses():
            end = rng.choices(list(spec['ends']), weights=list(spec['ends'].values()))[0]
            kind = end.rstrip('0123456789')
            draw_end(px, edge, layout.course_top(k), (kind, int(end[len(kind):] or 0)), (block, lit, rng))
        reaches, reach = [], 1
        for _ in range(layout.earth_y, HEIGHT):
            reach = max(-3, min(spec['out'] - 4, reach + rng.choice([-1, 0, 0, 1])))
            reaches.append(reach)
        draw_earth(px, edge, reaches, layout, earth)
        for _ in range(spec['roots']):
            start = (edge + rng.randint(-1, 2), layout.earth_y - 3 + rng.randint(0, 7))
            draw_root(px, start, rng.randint(5, 13), (edge - spec['inside'], edge + spec['out']))
    shade_by_depth(face)
    return face


def make_breach(ground, layout, rng):
    block, earth, lit = profiles(ground, layout)
    width = BREACH['inside'] + BREACH['out']
    face = Image.new('RGBA', (width * len(BREACH_BANKS), HEIGHT))
    px = face.load()
    for v, bank in enumerate(BREACH_BANKS):
        edge = v * width + BREACH['inside']
        for k, end in enumerate(bank['courses']):
            top = layout.course_top(k)
            draw_end(px, edge, top, end, (block, lit, rng))
            if end[0] == 'jut':
                for i in range(end[1] - 1):
                    px[edge + i, top + len(block)] = CAVITY
            elif end[0] == 'gone':
                px[edge - end[1] + 1, top + len(block) - 2] = shade(block[3], 1.1)
        draw_earth(px, edge, bank['earth'], layout, earth)
        bounds = (edge - BREACH['inside'], edge + BREACH['out'])
        for x, y, length in bank['roots']:
            draw_root(px, (edge + x, layout.earth_y + y), length, bounds)
    shade_by_depth(face)
    return face


def make_cliff(ground, layout):
    # the end of the paving at the lip: its overhang, the end of the slab turned from the light,
    # and a few strands of creeper hanging off the edge
    cliff = Image.new('RGBA', (12, 26))
    px = cliff.load()
    surface = GROUND_Y - layout.top
    for row in range(9):
        colour = ground.getpixel((45, surface + row))
        px[9, row], px[10, row], px[11, row] = shade(colour, 0.85), colour, shade(colour, 0.7)
    px[11, 8] = (0, 0, 0, 0)
    for column, length in ((8, 6), (10, 11), (11, 4)):
        for row in range(9, 9 + length):
            px[column, row] = STEM
        px[column, 8 + length] = GRASS
        if length > 6:
            px[column - 1, 9 + length // 2] = GRASS
    return cliff


def courses(ground_path, folder, *rows):
    ground = Image.open(ground_path).convert('RGBA')
    layout = Layout(*rows)
    rng = random.Random(SEED)
    make_deep(ground, layout, rng).save(f'{folder}/deep.png')
    make_faces(ground, layout, rng).save(f'{folder}/face.png')
    make_breach(ground, layout, rng).save(f'{folder}/breach.png')
    make_cliff(ground, layout).save(f'{folder}/cliff.png')


def earth(ground_path, out_path, surface_row, from_row, band_rows):
    ground = Image.open(ground_path).convert('RGBA')
    top, start = GROUND_Y - int(surface_row), int(from_row)
    out = Image.new('RGBA', (ground.width, HEIGHT))
    rows_of(ground, top, start, out)
    band = ground.crop((0, start, ground.width, start + int(band_rows)))
    for k in range(1, (top + start) // band.height + 1):
        # every other band is turned upside down, so each meets the next on the same row and the
        # earth darkening with depth draws no line across the hill where two bands meet
        laid = band.transpose(Image.Transpose.FLIP_TOP_BOTTOM) if k % 2 else band
        out.paste(shifted(laid, EARTH_SHIFTS[k % len(EARTH_SHIFTS)]), (0, top + start - band.height * k))
    out.save(out_path)


if __name__ == '__main__':
    command, *args = sys.argv[1:]
    {'courses': courses, 'earth': earth}[command](*args)
