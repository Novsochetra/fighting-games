"""Cut a sheet into its six cells and read each back at the size it was painted."""
import os
import sys
from collections import deque

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bake_magenta_sheet import art_mask, bounds, defringe, despeckle, fold, is_background, read_blocks  # noqa: E402

# the thin lines ChatGPT draws between cells, and a few pixels inside them
INSET = 8
# anything smaller than this, apart from the head, is a stray fleck of paint
SPECK = 300
COLOURS = 28


def cut(sheet):
    width, height = sheet.size
    cell_w, cell_h = width // 3, height // 2
    return [sheet.crop((c * cell_w + INSET, r * cell_h + INSET, (c + 1) * cell_w - INSET, (r + 1) * cell_h - INSET))
            for r in range(2) for c in range(3)]


def shapes(image):
    pixels, (width, height) = image.load(), image.size
    seen = set()
    for y0 in range(height):
        for x0 in range(width):
            if (x0, y0) in seen or is_background(pixels[x0, y0]):
                continue
            group, queue = [], deque([(x0, y0)])
            seen.add((x0, y0))
            while queue:
                x, y = queue.popleft()
                group.append((x, y))
                for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= n[0] < width and 0 <= n[1] < height and n not in seen and not is_background(pixels[n]):
                        seen.add(n)
                        queue.append(n)
            yield group


def despecked(cell):
    """A fleck left on the magenta would be read as a frame of its own."""
    out = cell.copy()
    pixels = out.load()
    for group in list(shapes(cell)):
        if len(group) < SPECK:
            for point in group:
                pixels[point] = (255, 0, 255)
    return out


def read_cell(cell, block):
    cell = despecked(cell)
    mask = art_mask(cell)
    frame, _ = read_blocks(cell, mask, bounds(mask), (block, block))
    frame = fold([defringe(frame)], COLOURS, [1])[0]
    frame = despeckle(frame)
    return frame.crop(frame.getbbox())


def read_sheet(root, name, block):
    sheet = Image.open(os.path.join(root, f'{name}.webp')).convert('RGB')
    return [read_cell(cell, block) for cell in cut(sheet)]


def read_single(root, name, block):
    return read_cell(Image.open(os.path.join(root, f'{name}.webp')).convert('RGB'), block)
