"""Bake a ChatGPT pixel-art sheet drawn on magenta into a game strip.

An image model draws "pixel art" as blocks a few pixels wide, on a grid that drifts a little from
frame to frame. Each frame's grid is found from where its colours change, and one colour is read
from the middle of every block, which gives the art back at the size it was drawn. The magenta is
keyed out and the magenta blended into the edges cleaned off, the colours are folded to a small
palette, and the frames are packed side by side in equal cells, lined up on the art's base.

usage: python3 tools/bake_magenta_sheet.py SOURCE OUT [options]
  --colors N        palette size (default 32), split evenly between --groups
  --groups 2,1      frames per palette: a flash frame gets its own so it never crowds out the rest
  --common-grid     read every frame on the median grid, so all frames keep one scale
  --cell CX,CY      read every frame on this grid (block width and height in source pixels)
  --cuts X,X,...    frames are the shapes whose left edge falls between these columns, for sheets
                    where one frame reaches over another (default: frames are split on empty columns)
  --untint          pull purple smoke (drawn see-through over the magenta) back to grey-brown
  --upscale N       enlarge the baked art N times (whole numbers only)
  --anchor-rows R   how many bottom rows set each frame's horizontal centre (default 4)
  --anchor-left-run line frames up on the leftmost piece on the ground (a stump), not the whole base
  --keep-edges      skip the fringe cleanup, for art whose own colours are purple (dusk water)
  --inset N         trim N art pixels off every side of each frame (tiles drawn as rectangles)
  --preview PNG     also write the strip enlarged 6 times
"""
import argparse
from collections import Counter, deque
from statistics import median

from PIL import Image

GAP = 12  # columns of background that separate two frames
PAD = 1
SIDES = ((1, 0), (-1, 0), (0, 1), (0, -1))


def is_background(pixel):
    red, green, blue = pixel[:3]
    # only strong magenta: the art's own purples (dusk water, smoke) stay, and the thin blend
    # where the magenta meets the art is cleaned off by defringe()
    return red > 170 and blue > 170 and green < 100


def art_mask(image):
    width, height = image.size
    pixels = image.load()
    return [[not is_background(pixels[x, y]) for x in range(width)] for y in range(height)]


def column_frames(mask):
    filled = [any(row[x] for row in mask) for x in range(len(mask[0]))]
    spans, start, empty = [], None, 0
    for x, has_art in enumerate(filled + [False] * GAP):
        if has_art:
            start = x if start is None else start
            empty = 0
        elif start is not None:
            empty += 1
            if empty >= GAP:
                spans.append((start, x - empty + 1))
                start, empty = None, 0
    return [[[row[x] if left <= x < right else False for x in range(len(row))] for row in mask]
            for left, right in spans]


def shape_frames(mask, cuts):
    """Each 8-connected shape goes to the frame its left edge falls in."""
    height, width = len(mask), len(mask[0])
    seen = [[False] * width for _ in range(height)]
    frames = [[[False] * width for _ in range(height)] for _ in range(len(cuts) + 1)]
    for y0 in range(height):
        for x0 in range(width):
            if not mask[y0][x0] or seen[y0][x0]:
                continue
            shape, queue = [], deque([(x0, y0)])
            seen[y0][x0] = True
            while queue:
                x, y = queue.popleft()
                shape.append((x, y))
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < width and 0 <= ny < height and mask[ny][nx] and not seen[ny][nx]:
                            seen[ny][nx] = True
                            queue.append((nx, ny))
            left = min(x for x, _ in shape)
            frame = sum(left >= cut for cut in cuts)
            for x, y in shape:
                frames[frame][y][x] = True
    return frames


def bounds(mask):
    rows = [y for y, row in enumerate(mask) if any(row)]
    columns = [x for x in range(len(mask[0])) if any(row[x] for row in mask)]
    return columns[0], rows[0], columns[-1] + 1, rows[-1] + 1


def colour_edges(image, mask, box, axis):
    left, top, right, bottom = box
    pixels = image.load()
    found = []
    for o in range(top if axis == 'x' else left, bottom if axis == 'x' else right, 2):
        for i in range((left if axis == 'x' else top) + 1, right if axis == 'x' else bottom):
            a, b = ((i - 1, o), (i, o)) if axis == 'x' else ((o, i - 1), (o, i))
            if mask[a[1]][a[0]] and mask[b[1]][b[0]]:
                if sum(abs(p - q) for p, q in zip(pixels[a], pixels[b])) > 90:
                    found.append(i)
    return found


def grid_of(positions, low=4.0, high=10.0, cell=None):
    best = None
    cells = [cell] if cell else [low + i * 0.01 for i in range(int((high - low) / 0.01) + 1)]
    for size in cells:
        for step in range(40):
            phase = size * step / 40
            miss = sum(min((p - phase) % size, size - (p - phase) % size) for p in positions)
            score = miss / max(1, len(positions)) / size
            if best is None or score < best[0]:
                best = (score, size, phase)
    return best[1], best[2]


def read_blocks(image, mask, box, cells=None):
    left, top, right, bottom = box
    edges_x = colour_edges(image, mask, box, 'x')
    edges_y = colour_edges(image, mask, box, 'y')
    cell_x, phase_x = grid_of(edges_x, cell=cells and cells[0])
    cell_y, phase_y = grid_of(edges_y, cell=cells and cells[1])
    pixels = image.load()
    columns = int((right - left) / cell_x) + 2
    rows = int((bottom - top) / cell_y) + 2
    out = Image.new('RGBA', (columns, rows), (0, 0, 0, 0))
    for j in range(rows):
        for i in range(columns):
            centre_x = int(left + phase_x + (i - 1) * cell_x + cell_x / 2)
            centre_y = int(top + phase_y + (j - 1) * cell_y + cell_y / 2)
            votes = Counter()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    x, y = centre_x + dx, centre_y + dy
                    if 0 <= x < image.width and 0 <= y < image.height:
                        votes[(mask[y][x],) + tuple(v >> 2 for v in pixels[x, y])] += 1
            if votes:
                key = votes.most_common(1)[0][0]
                if key[0]:
                    out.putpixel((i, j), tuple(v << 2 | 2 for v in key[1:]) + (255,))
    return out.crop(out.getbbox()), (cell_x, cell_y)


def smoky(pixel):
    # magenta seen through smoke: red and blue alike, both well above green
    red, green, blue, alpha = pixel
    return alpha and red > green + 20 and blue > green + 20 and abs(red - blue) < 70


def fringed(pixel):
    # magenta blended into the art's edge: red and blue both well above green, which no colour
    # of the art itself has (a bright red spark has almost no blue, a yellow almost none either)
    red, green, blue, alpha = pixel
    return alpha and red > green + 30 and blue > green + 30


def untint(frame):
    out = frame.copy()
    pixels = out.load()
    for y in range(frame.height):
        for x in range(frame.width):
            red, green, blue, alpha = pixels[x, y]
            if smoky((red, green, blue, alpha)):
                pixels[x, y] = (green + int((red - green) * 0.6), green, green + int((blue - green) * 0.25), alpha)
    return out


def defringe(frame):
    """Fringed pixels on the art's edge go; inner ones take their neighbours' commonest colour."""
    out = frame.copy()
    width, height = frame.size
    for _ in range(4):
        source = out.copy().load()
        changed = False
        for y in range(height):
            for x in range(width):
                if not fringed(source[x, y]):
                    continue
                around = [source[x + dx, y + dy] for dx, dy in SIDES
                          if 0 <= x + dx < width and 0 <= y + dy < height]
                if len(around) < 4 or any(not n[3] for n in around):
                    out.putpixel((x, y), (0, 0, 0, 0))
                else:
                    good = Counter(n for n in around if not fringed(n))
                    if good:
                        out.putpixel((x, y), good.most_common(1)[0][0])
                changed = True
        if not changed:
            break
    return out.crop(out.getbbox())


def fold_group(frames, colours):
    sheet = Image.new('RGBA', (sum(f.width for f in frames), max(f.height for f in frames)))
    x = 0
    for frame in frames:
        sheet.paste(frame, (x, 0))
        x += frame.width
    if len({p for p in sheet.getdata() if p[3]}) <= colours:
        return frames
    alpha = sheet.getchannel('A')
    folded = sheet.convert('RGB').quantize(colors=colours, method=Image.Quantize.MEDIANCUT,
                                          kmeans=4, dither=Image.Dither.NONE).convert('RGBA')
    folded.putalpha(alpha)
    out, x = [], 0
    for frame in frames:
        out.append(folded.crop((x, 0, x + frame.width, frame.height)))
        x += frame.width
    return out


def fold(frames, colours, groups):
    out, start = [], 0
    for size in groups:
        out += fold_group(frames[start:start + size], colours // len(groups))
        start += size
    return out


def distance(a, b):
    return sum(abs(p - q) for p, q in zip(a[:3], b[:3]))


def despeckle(frame, near=60):
    """A pixel matching none of its four neighbours, close in colour to the commonest of them, is
    noise in the grain rather than a highlight: it takes that neighbour's colour."""
    out = frame.copy()
    source = frame.load()
    for y in range(frame.height):
        for x in range(frame.width):
            pixel = source[x, y]
            if not pixel[3]:
                continue
            around = [source[x + dx, y + dy] for dx, dy in SIDES
                      if 0 <= x + dx < frame.width and 0 <= y + dy < frame.height]
            if any(n == pixel for n in around) or any(not n[3] for n in around):
                continue
            common, count = Counter(around).most_common(1)[0]
            if count >= 2 and distance(common, pixel) <= near:
                out.putpixel((x, y), common)
    return out


def speckle(frame):
    source = frame.load()
    drawn = lone = 0
    for y in range(frame.height):
        for x in range(frame.width):
            if not source[x, y][3]:
                continue
            drawn += 1
            around = [source[x + dx, y + dy] for dx, dy in SIDES
                      if 0 <= x + dx < frame.width and 0 <= y + dy < frame.height]
            lone += not any(n == source[x, y] for n in around)
    return lone / drawn


def base_centre(frame, rows, left_run=False):
    alpha = frame.getchannel('A').load()
    columns = sorted({x for y in range(max(0, frame.height - rows), frame.height)
                      for x in range(frame.width) if alpha[x, y]})
    if left_run:
        run = [columns[0]]
        for x in columns[1:]:
            if x - run[-1] > 2:
                break
            run.append(x)
        columns = run
    return (min(columns) + max(columns) + 1) / 2


def pack(frames, anchor_rows, left_run=False):
    centres = [base_centre(frame, anchor_rows, left_run) for frame in frames]
    reach_left = max(centres)
    reach_right = max(f.width - c for f, c in zip(frames, centres))
    width = int(reach_left + 0.5) + int(reach_right + 0.5) + PAD * 2
    height = max(f.height for f in frames) + PAD * 2
    anchor_x = int(reach_left + 0.5) + PAD
    sheet = Image.new('RGBA', (width * len(frames), height), (0, 0, 0, 0))
    for i, (frame, centre) in enumerate(zip(frames, centres)):
        sheet.alpha_composite(frame, (i * width + anchor_x - int(centre + 0.5), height - PAD - frame.height))
    return sheet, width, height, anchor_x, height - PAD


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source')
    parser.add_argument('out')
    parser.add_argument('--colors', type=int, default=32)
    parser.add_argument('--groups')
    parser.add_argument('--common-grid', action='store_true')
    parser.add_argument('--cell')
    parser.add_argument('--cuts')
    parser.add_argument('--untint', action='store_true')
    parser.add_argument('--upscale', type=int, default=1)
    parser.add_argument('--anchor-rows', type=int, default=4)
    parser.add_argument('--anchor-left-run', action='store_true')
    parser.add_argument('--keep-edges', action='store_true')
    parser.add_argument('--inset', type=int, default=0)
    parser.add_argument('--preview')
    args = parser.parse_args()

    image = Image.open(args.source).convert('RGB')
    mask = art_mask(image)
    masks = shape_frames(mask, [int(c) for c in args.cuts.split(',')]) if args.cuts else column_frames(mask)
    fixed = tuple(float(c) for c in args.cell.split(',')) if args.cell else None
    read = [read_blocks(image, frame_mask, bounds(frame_mask), fixed) for frame_mask in masks]
    if args.common_grid and not fixed:
        cells = (median(grid[0] for _, grid in read), median(grid[1] for _, grid in read))
        read = [read_blocks(image, frame_mask, bounds(frame_mask), cells) for frame_mask in masks]
    frames = []
    for frame, grid in read:
        frame = untint(frame) if args.untint else frame
        if args.inset:
            frame = frame.crop((args.inset, args.inset, frame.width - args.inset, frame.height - args.inset))
        frames.append(frame if args.keep_edges else defringe(frame))
        print(f'frame: blocks {grid[0]:.2f} x {grid[1]:.2f} px, art {frames[-1].size}')
    groups = [int(n) for n in args.groups.split(',')] if args.groups else [len(frames)]
    frames = [despeckle(frame) for frame in fold(frames, args.colors, groups)]
    if args.upscale > 1:
        frames = [f.resize((f.width * args.upscale, f.height * args.upscale), Image.NEAREST) for f in frames]
    sheet, width, height, anchor_x, anchor_y = pack(frames, args.anchor_rows * args.upscale, args.anchor_left_run)
    sheet.save(args.out, optimize=True)
    colours = len({p for p in sheet.getdata() if p[3]})
    worst = max(speckle(frame) for frame in frames)
    print(f'{len(frames)} frames of {width}x{height}, anchor ({anchor_x}, {anchor_y}), '
          f'{colours} colours, speckle at most {worst:.2f}')
    if args.preview:
        sheet.resize((sheet.width * 6, sheet.height * 6), Image.NEAREST).save(args.preview)


if __name__ == '__main__':
    main()
