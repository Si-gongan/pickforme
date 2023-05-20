const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const primary = '#111E4F';
const secondary = '#4A5CA0';
const tertiary = '#DFE4F5';
const buttonText = '#E9E9E9';

export default {
  light: {
    text: primary,
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    buttonBackground: primary,
    buttonText, 
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    buttonBackground: primary,
    buttonText, 
  },
};
