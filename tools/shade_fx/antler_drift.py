"""Keeping the Antler Spirit Shade's wisps and motes inside the frame, and drawing them."""
from .frames import FW
from .particles import age_on, look_at, position

MARGIN = 2


def fits(particle, height):
    for age in range(particle.life):
        x, y = position(particle, age)
        for dx, dy, _ in look_at(particle, age):
            inside_x = MARGIN <= round(x + dx) < FW - MARGIN
            if not (inside_x and MARGIN <= round(y + dy) < height - MARGIN):
                return False
    return True


# a particle that would run off the frame dies before it gets there
def kept_in(particles, height):
    out = []
    for particle in particles:
        while particle.life > 1 and not fits(particle, height):
            particle.life -= 1
        if particle.life > 1:
            out.append(particle)
    return out


def stamp_on(frame, x, y, look, behind):
    for dx, dy, color in look:
        xi, yi = int(round(x + dx)), int(round(y + dy))
        crossing = not behind and color[3] == 255 and frame.extra['open'][yi, xi]
        for row, bare in zip(frame.rows, frame.extra['bare']):
            if row[yi, xi, 3] == 0 or (crossing and bare[yi, xi]):
                row[yi, xi] = color


# like particles.draw, but a particle not kept behind him may also cross the burning cloak
def draw_drift(frames, particles):
    for frame in frames:
        for particle in particles:
            age = age_on(particle, frame)
            if age is not None:
                x, y = position(particle, age)
                stamp_on(frame, x, y, look_at(particle, age), particle.behind)
