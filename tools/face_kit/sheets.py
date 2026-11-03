"""Which ChatGPT sheet holds which part of the face kit, and at what size it was painted.

Every sheet is six cells, three across and two down, numbered 1 to 6 row by row. ChatGPT paints
each sheet at its own scale, so each is read at the block size that brings its skull to the kit's
size (a radius of about 18.6 art px, `python3 tools/face_kit/bake.py --measure` prints it).
"""

SOURCE = 'concepts/naga-eleven/face-kit/chatgpt'

BLOCKS = {
    'hero-takes': 7.49,
    'bases': 7.4,
    'moods-hero': 7.54,
    'moods-friend': 7.58,
    'moods-ace': 7.47,
    'moods-wall': 7.25,
    'moods-child': 7.73,
    'moods-adult': 8.43,
    'hair-1': 6.6,
    'hair-2': 7.05,
    'hair-3': 7.47,
    'gear': 7.13,
}

MOODS = ['shout', 'grin', 'hurt', 'angry', 'surprised', 'calm']

# the child was only painted in moods; the others' neutral face is the base they were drawn from
NEUTRAL = {'hero': ('hero-takes', 1), 'friend': ('bases', 1), 'ace': ('bases', 2), 'wall': ('bases', 6),
           'adult': ('moods-adult', 4)}

FACES = {
    face: {**({'neutral': NEUTRAL[face]} if face in NEUTRAL else {}),
           **{mood: (f'moods-{face}', i + 1) for i, mood in enumerate(MOODS)}}
    for face in ['hero', 'friend', 'ace', 'wall', 'child', 'adult']
}

HAIR = {
    'spiky': ('hair-1', 1), 'crop': ('hair-1', 2), 'side-part': ('hair-1', 3),
    'curtains': ('hair-1', 4), 'curly': ('hair-1', 5), 'swept': ('hair-1', 6),
    'buzz': ('hair-2', 1), 'bowl': ('hair-2', 2), 'long-back': ('hair-2', 3),
    'mohawk': ('hair-2', 4), 'bedhead': ('hair-2', 5), 'top-knot': ('hair-2', 6),
    'afro': ('hair-3', 1), 'twists': ('hair-3', 2), 'cornrows': ('hair-3', 3),
    'shoulder': ('hair-3', 4), 'slicked': ('hair-3', 5), 'receding': ('hair-3', 6),
}

GEAR = {'headband': ('gear', 1), 'sweatband': ('gear', 2), 'cap': ('gear', 3), 'beanie': ('gear', 4)}

# facial hair follows the jaw, so each was painted with ChatGPT's edit tool on the adult face's
# stern cell (moods-adult 4), one picture a style, read at the size that gives the kit's skull
FACIAL = {'stubble': 'facial-stubble', 'moustache': 'facial-moustache', 'beard': 'facial-beard',
          'goatee': 'facial-goatee', 'sideburns': 'facial-sideburns'}
FACIAL_BLOCK = 21.0

# hair and gear sheets are lined up on the skull through the shirt: each sheet's shoulders sit
# the same way under its head as in this cell of it, where the skull shows
SKULL_SHOWN = {'hair-1': ('hero-takes', 1), 'hair-2': ('hero-takes', 1), 'hair-3': ('hair-3', 3),
               'gear': ('gear', 5)}

# the shades of skin and shirt are read against the hero's own neutral face, so a face with its
# mouth open does not come out a shade darker than the same face shut
CALIBRATION = ('hero-takes', 1)
