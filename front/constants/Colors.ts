// Color Palette
const palette = {
    // Light mode colors
    darkGray: '#1e1e1e',
    navy: '#111e4f',
    white: '#ffffff',
    lightGray: '#DFE4F5',
    borderGray: '#9FA7C3',

    // Dark mode colors
    darkText: '#D9D9D9',
    darkBg: '#111525',
    darkPrimary: '#424C75',
    darkSecondary: '#313854',
    darkTertiary: '#1D2336'
} as const;

// Theme configuration
export default {
    light: {
        text: {
            primary: palette.darkGray,
            secondary: palette.white,
            third: palette.lightGray
        },
        background: {
            primary: palette.white,
            secondary: palette.white,
            third: palette.lightGray
        },
        borderColor: {
            primary: palette.borderGray,
            secondary: palette.lightGray,
            third: palette.darkGray
        },
        button: {
            primary: {
                background: palette.navy,
                text: palette.white
            },
            secondary: {
                background: palette.white,
                text: palette.navy
            },
            third: {
                background: palette.lightGray,
                text: palette.darkGray
            }
        },
        border: {
            primary: palette.borderGray,
            secondary: palette.white,
            third: palette.lightGray
        }
    },
    dark: {
        text: {
            primary: palette.darkText,
            secondary: palette.darkText,
            third: palette.darkText
        },
        background: {
            primary: palette.darkBg,
            secondary: palette.darkBg,
            third: palette.darkBg
        },
        borderColor: {
            primary: palette.darkPrimary,
            secondary: palette.darkSecondary,
            third: palette.darkTertiary
        },
        button: {
            primary: {
                background: palette.darkPrimary,
                text: palette.darkText
            },
            secondary: {
                background: palette.darkSecondary,
                text: palette.darkText
            },
            third: {
                background: palette.darkTertiary,
                text: palette.darkText
            }
        },
        border: {
            primary: palette.borderGray,
            secondary: palette.darkSecondary,
            third: palette.darkTertiary
        }
    }
} as const;
