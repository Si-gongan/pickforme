import { useState } from 'react';
import { StyleSheet, TextProps, Pressable, PressableProps, ViewProps } from 'react-native';
import { useThemeColor, ThemeProps } from '../../hooks/useThemeColor';
import { View, Text } from '../Themed';
import LoginBottomSheet from '../BottomSheet/Login';
import { useAtomValue } from 'jotai';
import { userDataAtom } from '../../stores/auth/atoms';

interface ButtonProps extends ThemeProps, Omit<PressableProps, 'children'>, Pick<ViewProps, 'children'> {
  title?: string;
  textStyle?: TextProps['style'];
  checkLogin?: boolean;
  color?: 'primary' | 'secondary';
  size?: 'large' | 'medium' | 'small',
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingVertical: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowColor: 'rgba(17, 30, 79)',
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  large: {
    minHeight: 57,
  },
  medium: {
  },
  small: {
  },
  pressed: {
  },
  text: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 22,
  },
});

const Button = ({ size = 'large', onPress, children, lightColor, darkColor, checkLogin = false, color = 'primary', ...props }: ButtonProps) => {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonBackground', color);
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
        <View style={[props.style, styles.button, styles[size], { backgroundColor }, pressed && styles.pressed]}>
          {children}
          <Text style={[props.textStyle, styles.text, { color: buttonTextColor }]}>{props.title}</Text>
        </View>
      )}
    </Pressable>
    <LoginBottomSheet onClose={() => setVisible(false)} visible={visible} />
    </>
  );
}
export default Button;
