"""The Firefly Shade's look: he fights inside a living swarm of fireflies.

Fireflies circle him on looping paths, pulsing warm white to lime as they fly, some passing behind
him, and on his ultimate they gather round the blade he raises. More rest on his cloak and blink,
lighting the cloth round them; the swarm behind him lights the cloak's trailing edge, which comes
apart into fireflies flickering off behind him, and sparks lift off its hem. On a swing the swarm
pours along after the blade. His eyes burn brighter in the hood and his blade blooms cyan. Bits of
the blade the weapon bake leaves loose in a weapon row are swept away first.
"""
from .firefly_glow import bloom_blade, light_eyes
from .firefly_hem import shed_from_hem
from .firefly_rest import rest_on_cloak
from .firefly_rim import light_rim
from .firefly_scene import set_scenes
from .firefly_shed import shed_from_edge
from .firefly_stream import stream_behind_swing
from .firefly_swarm import fly_swarm
from .firefly_tidy import sweep_loose_bits


def dress_strip(frames):
    sweep_loose_bits(frames)
    set_scenes(frames)
    light_eyes(frames)
    light_rim(frames)
    rest_on_cloak(frames)
    shed_from_hem(frames)
    shed_from_edge(frames)
    stream_behind_swing(frames)
    fly_swarm(frames)
    bloom_blade(frames)
