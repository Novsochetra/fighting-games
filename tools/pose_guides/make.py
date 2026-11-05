"""Draw the pose guides for Naga Eleven's player sheets, to hand ChatGPT with each sprite prompt.

    python3 tools/pose_guides/make.py [animation ...]

For each animation it writes, in concepts/naga-eleven/pose-guides/<animation>/:
  <direction>.png  the strip to attach: its frames left to right at 4x, a grey line between frames,
  sheet.png        every direction's strip, labelled, to check the whole animation at a glance,
  <direction>.gif  the strip played at the game's speed, to check the motion reads,
and chatgpt-prompts.md beside them, one prompt per strip.
His right limbs are red and orange, his left blue and cyan; the pale ball is only a guide.
"""

import os
import sys

from PIL import Image, ImageDraw, ImageFont

from animations import ANIMATIONS
from draw import GRID, INK, PAPER, frame_image
from prompts import document
from stage import ANCHOR, FRAME, GUIDE_SCALE as SCALE

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'concepts', 'naga-eleven', 'pose-guides')
LABEL = 120


def save_png(image, path):
    image.quantize(colors=64, method=Image.Quantize.MEDIANCUT).save(path, optimize=True)


def frames_of(animation, direction):
    size = animation.get('frame', FRAME)
    anchor = animation.get('anchor', ANCHOR)

    return [frame_image(pose, direction, SCALE, size, anchor) for pose in animation['frames']]


def strip(frames):
    width, height = frames[0].size
    image = Image.new('RGB', (width * len(frames), height), PAPER)
    lines = ImageDraw.Draw(image)

    for index, frame in enumerate(frames):
        image.paste(frame, (index * width, 0))

        if index:
            lines.line([(index * width, 0), (index * width, height)], fill=GRID, width=2)

    return image


def sheet(animation, strips):
    width, height = strips[0].size
    frame_width = width // len(animation['frames'])
    font = ImageFont.load_default(size=26)
    image = Image.new('RGB', (LABEL + width, 50 + height * len(strips)), PAPER)
    text = ImageDraw.Draw(image)

    for index in range(len(animation['frames'])):
        text.text((LABEL + index * frame_width + frame_width // 2, 26), str(index + 1), fill=INK,
                  font=font, anchor='mm')

    for row, (direction, image_strip) in enumerate(zip(animation['directions'], strips)):
        image.paste(image_strip, (LABEL, 50 + row * height))
        text.text((10, 50 + row * height + height // 2), direction, fill=INK, font=font, anchor='lm')
        text.line([(LABEL, 50 + row * height), (LABEL + width, 50 + row * height)], fill=GRID, width=2)

    return image


def write(animation):
    folder = os.path.join(OUT, animation['name'])
    os.makedirs(folder, exist_ok=True)
    strips = []

    for direction in animation['directions']:
        frames = frames_of(animation, direction)
        strips.append(strip(frames))
        save_png(strips[-1], os.path.join(folder, f'{direction}.png'))
        duration = max(80, round(1000 / animation['fps'])) if animation['fps'] > 1 else 600
        frames[0].save(os.path.join(folder, f'{direction}.gif'), save_all=True,
                       append_images=frames[1:], duration=duration, loop=0)

    save_png(sheet(animation, strips), os.path.join(folder, 'sheet.png'))
    print(f"{animation['name']}: {len(animation['frames'])} frames x {len(strips)} directions")


def main(names):
    for animation in ANIMATIONS:
        if not names or animation['name'] in names:
            write(animation)

    with open(os.path.join(OUT, 'chatgpt-prompts.md'), 'w') as prompts:
        prompts.write(document(ANIMATIONS))


if __name__ == '__main__':
    main(sys.argv[1:])
