const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const primary = '#111E4F';
const primaryDark = '#424C75';
const secondary = '#4A5CA0';
const secondaryDark = '#313854';
const tertiary = '#DFE4F5';
const tertiaryDark = '#1D2336';
const buttonText = '#EFEFEF';
const secondary2 = '#9FA7C3';

export default {
    light: {
        text: {
            primary: '#1E1E1E',
            secondary: '#fff',
            tertiary
        },
        background: {
            primary: '#fff',
            secondary: '#fff',
            tertiary
        },
        tint: {
            primary: tintColorLight,
            secondary: tintColorLight,
            tertiary
        },
        tabIconDefault: {
            primary: '#ccc',
            secondary: '#ccc',
            tertiary
        },
        tabIconSelected: {
            primary: tintColorLight,
            secondary: tintColorLight,
            tertiary
        },
        card: {
            primary: tertiary,
            secondary: tertiary,
            tertiary
        },
        buttonBackground: {
            primary,
            secondary,
            tertiary: '#FFFFFF'
        },
        disabledButtonBackground: {
            primary: secondary2,
            secondary: secondary2,
            tertiary: secondary2
        },
        buttonText: {
            primary: buttonText,
            secondary: buttonText,
            tertiary: primary
        },
        borderColor: {
            primary: secondary2,
            secondary: tertiary,
            tertiary
        }
    },
    dark: {
        text: {
            primary: '#D9D9D9',
            secondary: '#D9D9D9',
            tertiary: '#D9D9D9'
        },
        background: {
            primary: '#111525',
            secondary: '#111525',
            tertiary: '#111525'
        },
        tint: {
            primary: tintColorDark,
            secondary: tintColorDark,
            tertiary
        },
        tabIconDefault: {
            primary: '#ccc',
            secondary: '#ccc',
            tertiary
        },
        tabIconSelected: {
            primary: tintColorDark,
            secondary: tintColorDark,
            tertiary
        },
        buttonBackground: {
            primary: primaryDark,
            secondary: secondaryDark,
            tertiary: tertiaryDark
        },
        card: {
            primary: tertiaryDark,
            secondary: tertiaryDark,
            tertiary: tertiaryDark
        },
        disabledButtonBackground: {
            primary: secondary2,
            secondary: secondary2,
            tertiary
        },
        buttonText: {
            primary: buttonText,
            secondary: buttonText,
            tertiary: buttonText
        },
        borderColor: {
            primary: secondary2,
            secondary: secondary2,
            tertiary: secondary2
        }
    }
};
