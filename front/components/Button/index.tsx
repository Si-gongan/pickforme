import { useState } from 'react';
import { StyleSheet, TextProps, Pressable, PressableProps, ViewProps } from 'react-native';
import { useThemeColor, ThemeProps } from '../../hooks/useThemeColor';
import { View, Text } from '../Themed';

interface ButtonTextProps extends ThemeProps, Pick<TextProps, 'children' | 'numberOfLines' | 'ellipsizeMode'> {
  textStyle?: TextProps['style'];
}
interface ButtonProps extends  Omit<PressableProps, 'children'>, ButtonTextProps {
  title?: string;
  variant?: 'contain' | 'text',
  color?: 'primary' | 'secondary' | 'tertiary';
  size?: 'large' | 'medium' | 'small',
  renderChildrenPosition?: 'front' | 'back';
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  large: {
    minHeight: 57,
    paddingVertical: 16,
  },
  medium: {
    minHeight: 36,
  },
  small: {
    minHeight: 31,
  },
  pressed: {
  },
  contain: {
  },
  text: {
    minHeight: 0,
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
  },
});

const textStyles = StyleSheet.create({
  base: {
    fontWeight: '600',
  },
  large: {
    fontSize: 18,
    lineHeight: 22,
  },
  medium: {
    fontSize: 16,
    lineHeight: 19,
  },
  small: {
    fontSize: 14,
    lineHeight: 17,
  },
});

export const ButtonText = ({ color = 'primary', textStyle, lightColor, darkColor, children, ...props }: ButtonTextProps) => {
  const buttonTextColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonText', color);
  return <Text style={[{ color: buttonTextColor }, textStyle]} {...props}>{children}</Text>
}

const Button = ({
  variant = 'contain',
  style,
  size = 'large',
  onPress,
  numberOfLines,
  children,
  lightColor,
  darkColor,
  color = 'primary',
  textStyle,
  renderChildrenPosition = 'front',
  ...props
}: ButtonProps) => {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonBackground', color);
  const disabledBackgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'disabledButtonBackground', color);
  const buttonTextColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonText', color);
  const handlePress: PressableProps['onPress'] = (e) => {
    if (props.disabled ){
      return;
    }
    if (onPress) {
      onPress(e);
    }
  }
  return (
    <Pressable onPress={handlePress} {...props}>
      {({ pressed }) => (
        <View style={[styles.button, styles[size], { backgroundColor: props.disabled ? disabledBackgroundColor : backgroundColor }, pressed && styles.pressed, styles[variant], style]}>
          {renderChildrenPosition === 'front' && children}
          {props.title && (
            <ButtonText
              numberOfLines={numberOfLines}
              textStyle={[textStyles.base, textStyles[size], textStyle]}
              lightColor={lightColor}
              darkColor={darkColor}
              color={color}
            >
              {props.title}
            </ButtonText>
          )}
          {renderChildrenPosition === 'back' && children}
        </View>
      )}
    </Pressable>
  );
}
export default Button;
