// black hair catches a cool blue-grey highlight, as anime black hair does, so its shape still reads
const ramp = (hairLight, hair, hairShade, hairDark) => ({ hairLight, hair, hairShade, hairDark });

export const HAIRS = {
  black: ramp('#56628a', '#2a2e44', '#181724', '#0e0b12'),
  softBlack: ramp('#6a5a6e', '#33283a', '#1e1824', '#100c12'),
  white: ramp('#fdfaf2', '#ddd7cd', '#aaa2a2', '#6b6372'),
  grey: ramp('#c9c8cf', '#8f8d99', '#5e5c6c', '#363442'),
  blond: ramp('#fff3b0', '#e8c463', '#b98a3d', '#6f4a25'),
  brown: ramp('#8a5a3c', '#55321f', '#331c14', '#1a0e0c'),
};

export const GREY_TEMPLES = { greyLight: '#d4d2da', grey: '#8e8c9a' };

export const IRISES = {
  brown: { iris: '#4e2c22', irisLight: '#9a5c36' },
  amber: { iris: '#4a2418', irisLight: '#d98a3a' },
  dark: { iris: '#2a1c22', irisLight: '#6a4a4a' },
  blue: { iris: '#2f4f8f', irisLight: '#71a4dc' },
  green: { iris: '#2f5a3a', irisLight: '#6fae6a' },
};
