import { StyleSheet, TextProps, Pressable, PressableProps, ViewProps } from 'react-native';
import { useThemeColor, ThemeProps } from '../../hooks/useThemeColor';
import { View, Text } from '../Themed';

interface ButtonProps extends ThemeProps, Omit<PressableProps, 'children'>, Pick<ViewProps, 'children'> {
  title?: string;
  textStyle: TextProps['style'];
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
  pressed: {
  },
  text: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 22,
  },
});

const Button = ({ children, lightColor, darkColor, ...props }: ButtonProps) => {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonBackground');
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'buttonText');

  return (
    <Pressable {...props}>
      {({ pressed }) => (
        <View style={[props.style, styles.button, { backgroundColor }, pressed && styles.pressed]}>
          {children}
          <Text style={[props.textStyle, styles.text, { color }]}>{props.title}</Text>
        </View>
      )}
    </Pressable>
  );
}
export default Button;
