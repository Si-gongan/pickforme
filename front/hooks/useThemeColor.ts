import Colors from '../constants/Colors';
import useColorScheme from './useColorScheme';

export function useThemeColor<T extends keyof typeof Colors.light & keyof typeof Colors.dark>(
    props: { light?: string; dark?: string },
    colorName: T,
    color: 'primary' | 'secondary' | 'third'
) {
    const theme = useColorScheme() ?? 'light';
    const colorFromProps = props[theme];

    if (colorFromProps) {
        return colorFromProps;
    } else {
        return Colors[theme][colorName][color];
    }
}

export type ThemeProps = {
    lightColor?: string;
    darkColor?: string;
};
