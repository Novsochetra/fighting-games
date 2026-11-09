"""Sample players for the inspector: one face for all, told apart by skin, hair, scars, kit and gear."""

SKINS = {
    'tan': ['#6e2a26', '#ad5639', '#e59660', '#fbca94'],
    'light': ['#8a4a3a', '#c97f63', '#f0b48e', '#ffd8b8'],
    'olive': ['#5a2e1a', '#94532c', '#c47c45', '#e2a466'],
    'deep': ['#2e1410', '#5a2a1c', '#8a4a2c', '#b0703e'],
}

HAIRS = {
    'navy': ['#1a1030', '#2f2456', '#4a3f8c', '#6f86e0'],
    'black': ['#0e0b10', '#1e1a24', '#2f2a38', '#5a5468'],
    'platinum': ['#6b6478', '#a8a0b8', '#e0dcea', '#ffffff'],
    'copper': ['#4a0e12', '#8a1c1c', '#c8382a', '#ff7a4a'],
    'brown': ['#2a160e', '#4a2a18', '#734424', '#a8683a'],
}

KITS = {
    'cambodia': {'shirt': ['#850d19', '#b7101c', '#df2321', '#f2543a'], 'trim': ['#c87a1c', '#fcb94c', '#ffe07a'],
                 'shorts': ['#10123c', '#191c5a', '#283ca0', '#3f58c0'], 'stripe': ['#8980ae', '#dfdae6'],
                 'socks': ['#850d19', '#b7101c', '#df2321', '#f2543a']},
    'sky': {'shirt': ['#1d4f7a', '#2f7fb8', '#5cb4e8', '#9ad8ff'], 'trim': ['#8a90b0', '#dfe6f5', '#ffffff'],
            'shorts': ['#0c0c14', '#1a1a26', '#2a2a3a', '#44445a'], 'stripe': ['#2f7fb8', '#9ad8ff'],
            'socks': ['#1d4f7a', '#2f7fb8', '#5cb4e8', '#9ad8ff']},
    'forest': {'shirt': ['#0f3d24', '#1b6b3a', '#2f9a52', '#5cc47a'], 'trim': ['#8a90b0', '#dfe6f5', '#ffffff'],
               'shorts': ['#7a7896', '#b8b6d0', '#e8e6f2', '#ffffff'], 'stripe': ['#1b6b3a', '#5cc47a'],
               'socks': ['#0f3d24', '#1b6b3a', '#2f9a52', '#5cc47a']},
    'keeper': {'shirt': ['#7a5a08', '#c49a10', '#f2cc28', '#fff07a'], 'trim': ['#0c0c14', '#2a2a3a', '#4a4a5e'],
               'shorts': ['#0c0c14', '#1a1a26', '#2a2a3a', '#44445a'], 'stripe': ['#c49a10', '#fff07a'],
               'socks': ['#0c0c14', '#1a1a26', '#2a2a3a', '#44445a']},
}

BOOTS = {
    'white': {'boots': ['#6a6592', '#a7a2c6', '#ebe8f2', '#ffffff'], 'sole': ['#2a2440', '#4a4468']},
    'black': {'boots': ['#0e0c14', '#221e2c', '#3a3448', '#6a6280'], 'sole': ['#c87a1c', '#f2b236']},
    'gold': {'boots': ['#7a4a08', '#c48a14', '#f2c43a', '#fff0a0'], 'sole': ['#2a2440', '#4a4468']},
}

EYES = {
    'amber': ['#180411', '#5a2a1e', '#e6e2ee'],
    'blue': ['#101a3a', '#2f6fd0', '#ffffff'],
    'green': ['#0e2412', '#3f8a3a', '#ffffff'],
    'grey': ['#16161e', '#6a7080', '#ffffff'],
}

GEAR_COLOURS = {
    'wristbands': ['#5d5a86', '#9d9ac0', '#e6e2f0', '#ffffff'],
    'captain-band': ['#8a4a0c', '#d98a1c', '#f6c544', '#fff0a0'],
    'headband': ['#6b0f22', '#b51d36', '#e8404f', '#ff8a8a'],
    'keeper-gloves': ['#1a4d2e', '#2e8a4f', '#56c271', '#a8f0b4'],
    'nose-plaster': ['#8a5a3a', '#c98f62', '#efc39a', '#fde3c8'],
    'earrings': ['#8a5a12', '#e0a42a', '#fff2a8'],
}

PLAYERS = [
    {'name': 'Sochetra', 'role': 'Forward, the hero', 'skin': 'tan', 'hair': 'spiky', 'hairColour': 'navy',
     'eyes': 'amber', 'kit': 'cambodia', 'boots': 'white', 'number': 10, 'scars': [], 'gear': []},
    {'name': 'Viktor', 'role': 'Rival striker', 'skin': 'light', 'hair': 'buzz', 'hairColour': 'platinum',
     'eyes': 'blue', 'kit': 'sky', 'boots': 'black', 'number': 9, 'scars': ['split-brow'],
     'gear': ['earrings', 'wristbands']},
    {'name': 'Dara', 'role': 'Captain, centre back', 'skin': 'deep', 'hair': 'bowl', 'hairColour': 'black',
     'eyes': 'amber', 'kit': 'forest', 'boots': 'gold', 'number': 4, 'scars': ['cheek-slash'],
     'gear': ['captain-band']},
    {'name': 'Rafa', 'role': 'Goalkeeper', 'skin': 'olive', 'hair': 'mohawk', 'hairColour': 'copper',
     'eyes': 'green', 'kit': 'keeper', 'boots': 'black', 'number': 1, 'scars': ['eye-scar'],
     'gear': ['keeper-gloves', 'headband']},
]
