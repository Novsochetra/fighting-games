"""Pack each enemy's grid sheet into a small sheet of its painted pieces, the one the game loads.

    python3 tools/pack_enemy_sheets.py

The grid sheets in assets/sprites/enemies/ stay the source the art is drawn in: one row per strip
and one cell per frame, laid out as src/data/enemies/enemy-sprites.js says. Most of a cell is empty
(a boss's cell is as big as its widest move), and a browser keeps every pixel of a sheet it draws,
empty or not: the twelve boss sheets took 218 MB. So each frame is cut to the box its paint fills,
with one transparent pixel round it (a frame scaled onto a fraction of a screen pixel softens its
edge, and that soft edge must fall on nothing), identical pieces are kept once, and the pieces are
packed into assets/sprites/enemies/packed/ in the sheet's own palette, so every pixel keeps its
color. src/data/enemies/atlas/<id>.js gets each frame's piece and where that piece sat in its cell.

Run it again after changing a grid sheet: test/unit/data/enemy-atlas.test.js fails until you do.
"""

import json
import os
import subprocess
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, 'apps', 'web', 'games', 'steel-and-dust')
SHEETS = os.path.join(GAME, 'assets', 'sprites', 'enemies')
PACKED = os.path.join(SHEETS, 'packed')
ATLAS = os.path.join(GAME, 'src', 'data', 'enemies', 'atlas')
PAD = 1
MAX_WIDTH = 2048
HEADER = '// written by tools/pack_enemy_sheets.py from {}: run it again after changing the sheet\n'
INDEX_HEADER = '// written by tools/pack_enemy_sheets.py: run it again after adding an enemy sheet\n'

# the frame size of each sheet comes from the game's own table, so the two never disagree
READ_SPRITES = """
const { ENEMY_SPRITES } = await import(process.argv[1]);
const sizes = Object.entries(ENEMY_SPRITES).map(([id, s]) => [id, s.file, s.frameWidth, s.frameHeight]);
console.log(JSON.stringify(sizes));
"""


def read_sprites():
    table = os.path.join(GAME, 'src', 'data', 'enemies', 'enemy-sprites.js')
    output = subprocess.run(
        ['node', '--input-type=module', '-e', READ_SPRITES, '--', 'file://' + table],
        check=True, capture_output=True, text=True,
    ).stdout
    return json.loads(output)


def clear_index(sheet):
    transparency = sheet.info.get('transparency')
    if isinstance(transparency, int):
        return transparency
    return transparency.index(0)


def cut_frames(sheet, frame_width, frame_height):
    """Each row of cells as a list of (cell left, cell top, paint box) or None for an empty cell,
    without the empty cells after a row's last frame."""
    alpha = sheet.convert('RGBA').getchannel('A')
    rows = []
    for top in range(0, sheet.height, frame_height):
        row = []
        for left in range(0, sheet.width, frame_width):
            box = alpha.crop((left, top, left + frame_width, top + frame_height)).getbbox()
            row.append(None if box is None else (left, top, box))
        while row and row[-1] is None:
            row.pop()
        rows.append(row)
    return rows


def padded_piece(sheet, frame, clear):
    left, top, (x0, y0, x1, y1) = frame
    paint = sheet.crop((left + x0, top + y0, left + x1, top + y1))
    piece = Image.new('P', (x1 - x0 + 2 * PAD, y1 - y0 + 2 * PAD), clear)
    piece.putpalette(sheet.getpalette())
    piece.paste(paint, (PAD, PAD))
    return piece


def shelf_pack(sizes, width):
    x = y = shelf = 0
    spots = []
    for piece_width, piece_height in sizes:
        if x + piece_width > width:
            x, y, shelf = 0, y + shelf, 0
        spots.append((x, y))
        x += piece_width
        shelf = max(shelf, piece_height)
    return spots, y + shelf


def best_layout(pieces):
    """The tallest pieces first, in rows, on the sheet width that wastes the least area."""
    order = sorted(range(len(pieces)), key=lambda i: (-pieces[i].height, -pieces[i].width, i))
    sizes = [pieces[i].size for i in order]
    widest = max(width for width, _ in sizes)
    best = None
    for width in range(widest, max(widest, MAX_WIDTH) + 1, 8):
        spots, height = shelf_pack(sizes, width)
        if best is None or width * height < best[0] * best[1]:
            best = (width, height, spots)
    width, height, spots = best
    placed = [None] * len(pieces)
    for spot, index in zip(spots, order):
        placed[index] = spot
    return width, height, placed


def unique_pieces(sheet, rows, clear):
    """The distinct pieces, and for each frame the index of its piece and where its box sat."""
    pieces, seen, frames = [], {}, []
    for row in rows:
        frames.append([])
        for frame in row:
            if frame is None:
                frames[-1].append(None)
                continue
            piece = padded_piece(sheet, frame, clear)
            key = (piece.size, piece.tobytes())
            if key not in seen:
                seen[key] = len(pieces)
                pieces.append(piece)
            x0, y0 = frame[2][0] - PAD, frame[2][1] - PAD
            frames[-1].append((seen[key], x0, y0))
    return pieces, frames


def pack_sheet(file, frame_width, frame_height):
    sheet = Image.open(os.path.join(SHEETS, file))
    clear = clear_index(sheet)
    pieces, frames = unique_pieces(sheet, cut_frames(sheet, frame_width, frame_height), clear)
    width, height, spots = best_layout(pieces)
    packed = Image.new('P', (width, height), clear)
    packed.putpalette(sheet.getpalette())
    for piece, spot in zip(pieces, spots):
        packed.paste(piece, spot)
    packed.save(os.path.join(PACKED, file), transparency=sheet.info['transparency'])
    atlas = [
        [None if f is None else [*spots[f[0]], *pieces[f[0]].size, f[1], f[2]] for f in row]
        for row in frames
    ]
    return atlas, (sheet.width * sheet.height, width * height)


def module_text(file, atlas):
    rows = ',\n'.join(
        '  [\n' + ''.join(f'    {json.dumps(f)},\n' for f in row) + '  ]' if row else '  []'
        for row in atlas
    )
    return HEADER.format(file) + f'export const PIECES = [\n{rows},\n];\n'


def index_text(ids):
    imports = ''.join(f"import {{ PIECES as {i} }} from './{i}.js';\n" for i in ids)
    return INDEX_HEADER + imports + '\nexport const ENEMY_ATLAS = {\n' + ''.join(
        f'  {i},\n' for i in ids) + '};\n'


def main():
    os.makedirs(PACKED, exist_ok=True)
    os.makedirs(ATLAS, exist_ok=True)
    sprites = read_sprites()
    written = []
    before = after = 0
    for sprite_id, file, frame_width, frame_height in sprites:
        atlas, (grid_pixels, packed_pixels) = pack_sheet(file, frame_width, frame_height)
        path = os.path.join(ATLAS, f'{sprite_id}.js')
        with open(path, 'w') as out:
            out.write(module_text(file, atlas))
        written.append(path)
        before, after = before + grid_pixels, after + packed_pixels
        print(f'{file:16s} {grid_pixels * 4 / 2**20:5.1f} MB -> {packed_pixels * 4 / 2**20:4.1f} MB')
    ids = sorted(sprite_id for sprite_id, *_ in sprites)
    index = os.path.join(ATLAS, 'index.js')
    with open(index, 'w') as out:
        out.write(index_text(ids))
    written.append(index)
    # the written modules are laid out as the repo's Prettier lays them out, so a check passes
    subprocess.run(['npx', 'prettier', '--write', '--log-level', 'warn', *written], cwd=ROOT, check=True)
    print(f'all sheets unpacked: {before * 4 / 2**20:.0f} MB -> {after * 4 / 2**20:.0f} MB')


if __name__ == '__main__':
    sys.exit(main())
