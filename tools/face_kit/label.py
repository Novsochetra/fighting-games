"""Sort a baked cell's pixels into the parts of a face, by colour and by where they lie.

ChatGPT ignores colour codes, so nothing here trusts a colour alone: the skin is whatever is warm;
the shirt is the cool grey joined to the foot of the cell, and bluer than the hair; the hair is a
big grey shape reaching up to the head; the eye whites are the highest small white shapes, the
irises the dark warm pixels beside them, the teeth any lower white; the mouth is a strong red.
"""
from collections import deque

SIDES = ((1, 0), (-1, 0), (0, 1), (0, -1))
# a shape of grey this big is hair; smaller ones are glints on the skin
HAIR_LEAST = 40


def light(pixel):
    return 0.3 * pixel[0] + 0.59 * pixel[1] + 0.11 * pixel[2]


def groups_of(points, sides=SIDES):
    left, found = set(points), []
    while left:
        start = left.pop()
        group, queue = {start}, deque([start])
        while queue:
            x, y = queue.popleft()
            for dx, dy in sides:
                n = (x + dx, y + dy)
                if n in left:
                    left.discard(n)
                    group.add(n)
                    queue.append(n)
        found.append(group)
    return found


def middle_y(group):
    return sum(y for _, y in group) / len(group)


def pixels_of(image):
    rgba = image.convert('RGBA')
    return {(x, y): rgba.getpixel((x, y))[:3] for y in range(rgba.height) for x in range(rgba.width)
            if rgba.getpixel((x, y))[3]}


def split_cool(px, cool, height):
    shirt = set()
    for group in groups_of(cool):
        if any(y >= height - 4 for _, y in group):
            shirt |= {k for k in group if px[k][2] - px[k][0] >= 2 or light(px[k]) < 100}
    hair, whites, specks = set(), set(), set()
    for group in groups_of(cool - shirt):
        if len(group) > HAIR_LEAST and min(y for _, y in group) < 0.5 * height:
            hair |= group
        elif len(group) > HAIR_LEAST:
            shirt |= group
        elif light_mean(px, group) > 165 and len(group) >= 3 and 0.25 * height < middle_y(group) < 0.72 * height:
            whites |= group
        else:
            specks |= group
    return shirt, hair, whites, specks


def light_mean(px, group):
    return sum(light(px[k]) for k in group) / len(group)


def eye_whites_of(whites):
    ordered = sorted(groups_of(whites), key=middle_y)
    if not ordered:
        return set()
    top = middle_y(ordered[0])
    return set().union(*[g for g in ordered if middle_y(g) < top + 4])


def label(image):
    px = pixels_of(image)
    outline = {k for k, p in px.items() if sum(p) < 90}
    warm = {k for k, p in px.items() if k not in outline and p[0] > p[2] + 25}
    shirt, hair, whites, specks = split_cool(px, set(px) - outline - warm, image.height)
    eye_whites = eye_whites_of(whites)
    mouth = {k for k in warm if px[k][0] > 150 and px[k][0] > 2.1 * px[k][1]}
    warm -= mouth
    iris = {k for k in warm if light(px[k]) < 105 and any(
        (k[0] + dx, k[1] + dy) in eye_whites for dx in range(-3, 4) for dy in range(-1, 2))}
    return {'px': px, 'size': image.size, 'outline': outline, 'skin': (warm - iris) | specks, 'shirt': shirt,
            'hair': hair, 'eyes': eye_whites, 'teeth': whites - eye_whites, 'iris': iris, 'mouth': mouth}
