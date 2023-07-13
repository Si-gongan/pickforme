const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const primary = '#111E4F';
const secondary = '#4A5CA0';
const tertiary = '#DFE4F5';
const buttonText = '#EFEFEF';
const secondary2 = '#9FA7C3';

export default {
  light: {
    text: {
      primary,
      secondary,
      tertiary,
    },
    background: {
      primary: '#fff',
      secondary: '#fff',
      tertiary,
    },
    tint: {
      primary: tintColorLight,
      secondary: tintColorLight,
      tertiary,
    },
    tabIconDefault: {
      primary: '#ccc',
      secondary: '#ccc',
      tertiary,
    },
    tabIconSelected: {
      primary: tintColorLight,
      secondary: tintColorLight,
      tertiary,
    },
    card: {
      primary: tertiary,
      secondary: tertiary,
      tertiary,
    },
    buttonBackground: {
      primary,
      secondary,
      tertiary,
    },
    disabledButtonBackground: {
      primary: secondary2,
      secondary: secondary2,
      tertiary: secondary2,
    },
    buttonText: {
      primary: buttonText,
      secondary: buttonText,
      tertiary: primary,
    },
    borderColor: {
      primary: secondary2,
      secondary: tertiary,
      tertiary,
    },
  },
  dark: {
    text: {
      primary,
      secondary,
      tertiary,
    },
    background: {
      primary: '#fff',
      secondary: '#fff',
      tertiary,
    },
    tint: {
      primary: tintColorDark,
      secondary: tintColorDark,
      tertiary,
    },
    tabIconDefault: {
      primary: '#ccc',
      secondary: '#ccc',
      tertiary,
    },
    tabIconSelected: {
      primary: tintColorDark,
      secondary: tintColorDark,
      tertiary,
    },
    buttonBackground: {
      primary,
      secondary,
      tertiary,
    },
    card: {
      primary: tertiary,
      secondary: tertiary,
      tertiary,
    },
    disabledButtonBackground: {
      primary: secondary2,
      secondary: secondary2,
      tertiary,
    },
    buttonText: {
      primary: buttonText,
      secondary: buttonText,
      tertiary: primary,
    },
    borderColor: {
      primary: tertiary,
      secondary: tertiary,
      tertiary,
    },
  },
};
