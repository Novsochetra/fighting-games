"""Split the hornet nest's hanging frame into the nest and its branch, and paint the branch in the
bark of each forest's nest tree.

    python3 tools/bake_nest_branches.py <baked nest strip> <game folder>

The baked strip (tools/bake_magenta_sheet.py) holds the nest hanging from its branch (0), knocked
askew (1), falling (2) and broken (3). This writes, in the game's assets/sprites/fx/:

    hornetNest.png  the nest alone with the rope it hangs by (0), falling (1) and broken (2)
    nestBranch.png  the branch alone, once in each forest's bark, in FORESTS order

A branch takes its colours from a patch of its tree's bark in the forest's near layer: its pixels,
darkest to lightest, are given the patch's colours darkest to lightest, so it is the same wood,
hazed as far back as the tree is.
"""
import sys

from PIL import Image

FRAME, HEIGHT = 89, 72
# above this row the branch and the rope knotted round it are all there is; below it the branch's
# thick end and the nest stand apart, a clear gap between them on every row
KNOT_BOTTOM, BRANCH_BOTTOM = 21, 31
# the rope's loop round the branch, which stays with the nest
ROPE = (33, 10, 36, 22)
# each forest's near layer and the patch of its nest tree's bark (left, top, right, bottom); Pine
# Ridge's pine has no branch for its nest, which hangs by its rope among the needles
FORESTS = [
    ('old-grove', (128, 70, 166, 120)),
    ('bamboo-pass', (330, 80, 356, 130)),
    ('ember-woods', (326, 80, 358, 140)),
    ('firefly-hollow', (308, 70, 344, 130)),
]


def in_rope(x, y):
    left, top, right, bottom = ROPE
    return left <= x <= right and top <= y <= bottom


def branch_mask(hanging):
    pixels = hanging.load()
    mask = set()
    for y in range(BRANCH_BOTTOM):
        started = False
        for x in range(FRAME):
            alpha = pixels[x, y][3]
            if y > KNOT_BOTTOM and started and not alpha:
                break
            started = started or bool(alpha)
            if alpha:
                mask.add((x, y))
    return mask


def luminance(pixel):
    red, green, blue = pixel[:3]
    return 0.299 * red + 0.587 * green + 0.114 * blue


def bark_of(game, folder, box):
    layer = Image.open(f'{game}/assets/backdrops/{folder}/near.png').convert('RGBA')
    pixels = layer.load()
    left, top, right, bottom = box
    spots = [(x, y) for x in range(left, right) for y in range(top, bottom)]
    colours = [pixels[spot] for spot in spots if pixels[spot][3] == 255]
    return sorted(colours, key=lambda colour: (luminance(colour), colour))


def painted(hanging, mask, bark):
    pixels = hanging.load()
    ranked = sorted(mask, key=lambda spot: (luminance(pixels[spot]), spot))
    branch = Image.new('RGBA', (FRAME, HEIGHT))
    for rank, spot in enumerate(ranked):
        branch.putpixel(spot, bark[rank * (len(bark) - 1) // max(1, len(ranked) - 1)])
    return branch


def nest_alone(hanging, mask):
    nest = hanging.copy()
    for x, y in mask:
        if not in_rope(x, y):
            nest.putpixel((x, y), (0, 0, 0, 0))
    return nest


def strip_of(frames):
    strip = Image.new('RGBA', (FRAME * len(frames), HEIGHT))
    for index, frame in enumerate(frames):
        strip.paste(frame, (index * FRAME, 0))
    return strip


def main(source, game):
    baked = Image.open(source).convert('RGBA')
    frames = [baked.crop((i * FRAME, 0, (i + 1) * FRAME, HEIGHT)) for i in range(4)]
    mask = branch_mask(frames[0])
    branches = [painted(frames[0], mask, bark_of(game, *forest)) for forest in FORESTS]
    out = f'{game}/assets/sprites/fx/'
    strip_of([nest_alone(frames[0], mask), frames[2], frames[3]]).save(out + 'hornetNest.png')
    strip_of(branches).save(out + 'nestBranch.png')


if __name__ == '__main__':
    main(*sys.argv[1:])
