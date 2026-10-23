"""Cut the frames of a grid sheet to their paint and pack them into a small sheet: the part
tools/pack_enemy_sheets.py and tools/pack_hero_strips.py share.

A browser keeps every pixel of a sheet it draws, empty or not, and a grid sheet's cells are as big as
the widest frame they hold. So each frame is cut to the box its paint fills, with one transparent
pixel round it (a frame scaled onto a fraction of a screen pixel softens its edge, and that soft edge
must fall on nothing), identical pieces are kept once, and the pieces are packed in rows, tallest
first, on the width that wastes the least, in the sheet's own palette or colors, so every pixel keeps
its color. Each frame's entry is [x, y, width, height, left, top]: its piece in the packed sheet and
where that piece sat in the frame's cell, or None for a frame drawn empty.
"""

from PIL import Image

PAD = 1
MAX_WIDTH = 2048


def clear_of(sheet):
    if sheet.mode == 'RGBA':
        return (0, 0, 0, 0)
    transparency = sheet.info.get('transparency')
    return transparency if isinstance(transparency, int) else transparency.index(0)


def blank(sheet, size):
    image = Image.new(sheet.mode, size, clear_of(sheet))
    if sheet.mode == 'P':
        image.putpalette(sheet.getpalette())
    return image


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


def padded_piece(sheet, frame):
    left, top, (x0, y0, x1, y1) = frame
    piece = blank(sheet, (x1 - x0 + 2 * PAD, y1 - y0 + 2 * PAD))
    piece.paste(sheet.crop((left + x0, top + y0, left + x1, top + y1)), (PAD, PAD))
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


def unique_pieces(sheet, rows):
    """The distinct pieces, and for each frame the index of its piece and where its box sat."""
    pieces, seen, frames = [], {}, []
    for row in rows:
        frames.append([])
        for frame in row:
            if frame is None:
                frames[-1].append(None)
                continue
            piece = padded_piece(sheet, frame)
            key = (piece.size, piece.tobytes())
            if key not in seen:
                seen[key] = len(pieces)
                pieces.append(piece)
            frames[-1].append((seen[key], frame[2][0] - PAD, frame[2][1] - PAD))
    return pieces, frames


def save_like(image, sheet, path):
    if sheet.mode == 'P':
        image.save(path, transparency=sheet.info['transparency'])
    else:
        image.save(path)


def pack_sheet(sheet, frame_width, frame_height, path):
    """Writes the packed sheet to path; returns each row's entries and the pixels before and after."""
    pieces, frames = unique_pieces(sheet, cut_frames(sheet, frame_width, frame_height))
    if not pieces:
        raise ValueError(f'{path}: nothing is painted on the sheet')
    width, height, spots = best_layout(pieces)
    packed = blank(sheet, (width, height))
    for piece, spot in zip(pieces, spots):
        packed.paste(piece, spot)
    save_like(packed, sheet, path)
    entries = [
        [None if f is None else [*spots[f[0]], *pieces[f[0]].size, f[1], f[2]] for f in row]
        for row in frames
    ]
    return entries, (sheet.width * sheet.height, width * height)
