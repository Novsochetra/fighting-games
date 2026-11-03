"""The pitch's effect codes for a picture painted in key colours: `o` the outline, `d m l h` the
greys dark to light, `y g G` the greens, `r e E` the blues (src/render/effects/maps.js)."""
from label import light

RAMPS = {'grey': 'dmlh', 'green': 'ygG', 'blue': 'reE'}


def tone(pixel):
    red, green, blue = pixel
    if red + green + blue < 110:
        return None
    if green > red + 40 and green > blue + 40:
        return 'green'
    if blue > red + 40 and blue > green + 30:
        return 'blue'
    return 'grey'


def codes_of(frame):
    rgba = frame.convert('RGBA')
    pixels = {(x, y): rgba.getpixel((x, y))[:3] for y in range(rgba.height) for x in range(rgba.width)
              if rgba.getpixel((x, y))[3]}
    tones = {k: tone(p) for k, p in pixels.items()}
    codes = {}
    for name, ramp in RAMPS.items():
        points = [k for k, t in tones.items() if t == name]
        values = [light(pixels[k]) for k in points] or [0]
        low, high = min(values), max(max(values), min(values) + 60)
        for k in points:
            step = int((light(pixels[k]) - low) / (high - low) * len(ramp))
            codes[k] = ramp[max(0, min(len(ramp) - 1, step))]
    codes.update({k: 'o' for k, t in tones.items() if t is None})
    return codes
