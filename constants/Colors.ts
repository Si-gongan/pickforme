const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const primary = '#111E4F';
const secondary = '#4A5CA0';
const tertiary = '#DFE4F5';
const buttonText = '#E9E9E9';

export default {
  light: {
    text: {
      primary,
      secondary,
    },
    background: {
      primary: '#fff',
      secondary: '#fff',
    },
    tint: {
      primary: tintColorLight,
      secondary: tintColorLight,
    },
    tabIconDefault: {
      primary: '#ccc',
      secondary: '#ccc',
    },
    tabIconSelected: {
      primary: tintColorLight,
      secondary: tintColorLight,
    },
    buttonBackground: {
      primary,
      secondary: tertiary,
    },
    buttonText: {
      primary: buttonText,
      secondary,
    },
  },
  dark: {
    text: {
      primary,
      secondary,
    },
    background: {
      primary: '#fff',
      secondary: '#fff',
    },
    tint: {
      primary: tintColorDark,
      secondary: tintColorDark,
    },
    tabIconDefault: {
      primary: '#ccc',
      secondary: '#ccc',
    },
    tabIconSelected: {
      primary: tintColorDark,
      secondary: tintColorDark,
    },
    buttonBackground: {
      primary,
      secondary: tertiary,
    },
    buttonText: {
      primary: buttonText,
      secondary,
    },
  },
};
