"""Draws a staged skeleton into one frame: colour-coded limbs (his right warm, his left cool), a
torso with volume, a head that shows where he looks, his shadow, the ball and the feet line.
"""

from PIL import Image, ImageDraw

from stage import ANCHOR, BALL_RADIUS, FRAME, nearness, project, staged
from skeleton import HEAD_RADIUS

INK = (34, 36, 44)
PAPER = (246, 245, 240)
GRID = (200, 200, 196)
FEET_LINE = (150, 190, 150)
SHADOW = (205, 205, 198)
TORSO = (132, 138, 150)
SHORTS = (88, 92, 104)
HEAD = (250, 247, 238)
GHOST_BALL = (226, 226, 220)

LIMB_COLOURS = {
    'r_leg': (226, 64, 64),
    'r_arm': (245, 150, 30),
    'l_leg': (52, 112, 236),
    'l_arm': (30, 184, 200),
}

# (from, to, width in game pixels, colour key)
BONES = [
    ('{s}_hip', '{s}_knee', 3.4, '{s}_leg'),
    ('{s}_knee', '{s}_ankle', 2.8, '{s}_leg'),
    ('{s}_ankle', '{s}_toe', 2.6, '{s}_leg'),
    ('{s}_shoulder', '{s}_elbow', 2.6, '{s}_arm'),
    ('{s}_elbow', '{s}_hand', 2.2, '{s}_arm'),
]


class Pen:
    def __init__(self, image, scale, origin, anchor):
        self.draw = ImageDraw.Draw(image)
        self.scale = scale
        self.origin = origin
        self.anchor = anchor

    def at(self, point):
        x, y = project(point, self.anchor)

        return (self.origin[0] + x * self.scale, self.origin[1] + y * self.scale)

    def stroke(self, start, end, width, colour):
        for fill, extra in ((INK, 1.1), (colour, 0)):
            pixels = (width + extra) * self.scale
            self.draw.line([start, end], fill=fill, width=round(pixels))

            for x, y in (start, end):
                radius = pixels / 2
                self.draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=fill)

    def disc(self, centre, radius, colour, outline=True):
        x, y = centre
        pixels = radius * self.scale
        border = round(0.55 * self.scale) if outline else 0
        self.draw.ellipse([x - pixels, y - pixels, x + pixels, y + pixels], fill=colour,
                          outline=INK if outline else None, width=border)


def bone_items(world, pen):
    items = []

    for side in ('l', 'r'):
        for start, end, width, colour in BONES:
            a, b = world[start.format(s=side)], world[end.format(s=side)]
            depth = (nearness(a) + nearness(b)) / 2
            items.append((depth, lambda a=a, b=b, w=width, c=LIMB_COLOURS[colour.format(s=side)]:
                          pen.stroke(pen.at(a), pen.at(b), w, c)))
            items.append((depth + 0.01, lambda b=b, w=width, c=LIMB_COLOURS[colour.format(s=side)]:
                          pen.disc(pen.at(b), w * 0.42, c, outline=False)))

    return items


def torso_item(world, pen):
    corners = [world[name] for name in ('l_hip', 'r_hip', 'r_shoulder', 'l_shoulder')]
    depth = sum(nearness(point) for point in corners) / 4

    def paint():
        pen.stroke(pen.at(world['pelvis']), pen.at(world['neck']), 7.5, TORSO)
        pen.draw.polygon([pen.at(point) for point in corners], fill=TORSO, outline=INK,
                         width=round(0.5 * pen.scale))
        pen.stroke(pen.at(world['l_hip']), pen.at(world['r_hip']), 4.2, SHORTS)

    return [(depth, paint)]


def head_item(world, face_forward, face_left, pen):
    centre = world['head']

    def paint():
        pen.disc(pen.at(centre), HEAD_RADIUS, HEAD)
        nose = centre + face_forward * HEAD_RADIUS * 0.95

        if nearness(nose) >= nearness(centre) - 0.2:
            for sign in (1, -1):
                eye = centre + face_forward * HEAD_RADIUS * 0.75 + face_left * sign * 2.8
                eye[2] += 1.2
                pen.disc(pen.at(eye), 0.9, INK, outline=False)

        if nearness(nose) >= nearness(centre) - 2:
            pen.stroke(pen.at(centre + face_forward * 5), pen.at(nose), 1.0, INK)

    return [(nearness(centre), paint)]


def ball_item(world, pen):
    if 'ball' not in world:
        return []

    centre = world['ball']

    def paint():
        x, y = pen.at(centre)
        shadow = pen.at(centre * [1, 1, 0])
        pen.draw.ellipse([shadow[0] - 3 * pen.scale, shadow[1] - 1.3 * pen.scale,
                          shadow[0] + 3 * pen.scale, shadow[1] + 1.3 * pen.scale], fill=SHADOW)
        pen.disc((x, y), BALL_RADIUS, GHOST_BALL)

    return [(nearness(centre), paint)]


def ground(pen, world, width):
    scale, (left, top) = pen.scale, pen.origin
    feet_y = top + pen.anchor[1] * scale
    pen.draw.line([(left, feet_y), (left + width * scale, feet_y)], fill=FEET_LINE, width=round(0.4 * scale))
    x, y = pen.at(world['pelvis'] * [1, 1, 0])
    pen.draw.ellipse([x - 10 * scale, y - 3.2 * scale, x + 10 * scale, y + 3.2 * scale], fill=SHADOW)


def draw_frame(image, origin, scale, pose, direction, frame=FRAME, anchor=ANCHOR, bare=False):
    world, face_forward, face_left = staged(pose, direction, frame, anchor)
    pen = Pen(image, scale, origin, anchor)
    items = bone_items(world, pen) + torso_item(world, pen) + head_item(world, face_forward, face_left, pen)

    if not bare:
        ground(pen, world, frame[0])
        items += ball_item(world, pen)

    for _, paint in sorted(items, key=lambda item: item[0]):
        paint()


def frame_image(pose, direction, scale, frame=FRAME, anchor=ANCHOR, bare=False, supersample=4):
    """One frame, `scale` times the game's size, smoothed by drawing it larger and shrinking; a bare
    frame is the skeleton alone on a clear ground, to lay over another sheet's cells."""
    big = scale * supersample
    image = Image.new('RGBA', (frame[0] * big, frame[1] * big), (0, 0, 0, 0) if bare else PAPER + (255,))
    draw_frame(image, (0, 0), big, pose, direction, frame, anchor, bare)

    return image.resize((frame[0] * scale, frame[1] * scale), Image.LANCZOS)
