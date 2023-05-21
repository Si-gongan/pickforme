/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, useColorScheme, View as DefaultView } from 'react-native';

import { useThemeColor, ThemeProps } from '../hooks/useThemeColor';

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, color, ...otherProps } = props;
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text', color);

  return <DefaultText style={[{ color: textColor }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, color, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background', color);

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
