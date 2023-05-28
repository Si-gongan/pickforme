import { useState } from 'react';
import { StyleSheet, TextProps, Pressable, PressableProps, ViewProps } from 'react-native';
import { useThemeColor, ThemeProps } from '../../hooks/useThemeColor';
import { View, Text } from '../Themed';
import LoginBottomSheet from '../BottomSheet/Login';
import { useAtomValue } from 'jotai';
import { userDataAtom } from '../../stores/auth/atoms';

interface ButtonProps extends ThemeProps, Omit<PressableProps, 'children'>, Pick<ViewProps, 'children'> {
  title?: string;
  variant?: 'contain' | 'text',
  textStyle?: TextProps['style'];
  checkLogin?: boolean;
  color?: 'primary' | 'secondary' | 'tertiary';
  size?: 'large' | 'medium' | 'small',
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

const Button = ({
  variant = 'contain',
  style,
  size = 'large',
  onPress,
  children,
  lightColor,
  darkColor,
  checkLogin = false,
  color = 'primary',
  textStyle,
  ...props
}: ButtonProps) => {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonBackground', color);
  const disabledBackgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'disabledButtonBackground', color);
  const buttonTextColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonText', color);
  const isLogin = !!useAtomValue(userDataAtom);
  const [visible, setVisible] = useState(false);

  const handlePress: PressableProps['onPress'] = (e) => {
    if (checkLogin && !isLogin) {
      setVisible(true);
      return;
    }
    if (onPress) {
      onPress(e);
    }
  }
  return (
    <>
    <Pressable onPress={handlePress} {...props}>
      {({ pressed }) => (
        <View style={[styles.button, styles[size], { backgroundColor: props.disabled ? disabledBackgroundColor : backgroundColor }, pressed && styles.pressed, styles[variant], style]}>
          {children}
          <Text style={[textStyles.base, textStyles[size], { color: buttonTextColor }, textStyle]}>{props.title}</Text>
        </View>
      )}
    </Pressable>
    <LoginBottomSheet onClose={() => setVisible(false)} visible={visible} />
    </>
  );
}
export default Button;
