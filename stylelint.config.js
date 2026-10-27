const fromToken = (prefix) => new RegExp(`var\\(--${prefix}`);

export default {
  rules: {
    'color-no-hex': true,
    'color-named': 'never',
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'],
    'declaration-property-value-allowed-list': {
      'font-family': [fromToken('font-'), 'inherit'],
      'font-size': [fromToken('font-size-'), 'inherit'],
      'font-weight': [fromToken('font-weight-'), 'inherit'],
      'line-height': [fromToken('leading-'), 'inherit'],
      'letter-spacing': [fromToken('tracking-'), 'normal'],
      'box-shadow': [fromToken('shadow-'), 'none'],
      'text-shadow': [fromToken('text-shadow-'), 'none'],
      'border-radius': [fromToken('radius-'), '0'],
      transition: [fromToken('duration-'), 'none'],
      animation: [fromToken('duration-'), 'none'],
    },
  },
  overrides: [
    {
      files: ['**/tokens.css'],
      rules: {
        'color-no-hex': null,
        'function-disallowed-list': null,
        'declaration-property-value-allowed-list': null,
      },
    },
    {
      // a font face is declared in plain values: custom properties do not reach @font-face
      files: ['**/fonts.css'],
      rules: {
        'declaration-property-value-allowed-list': null,
      },
    },
  ],
};
