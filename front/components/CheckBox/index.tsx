/**
 * 체크박스 컴포넌트
 */
import { Pressable, View, Image } from "react-native";

import useStyles from "./style";

import type { ICheckBoxProps } from "./type";

export default function CheckBox({
  checked,
  onPress,
  ...props
}: ICheckBoxProps) {
  const styles = useStyles();

  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" {...props}>
      <View style={[styles.wrap, checked && styles.checked]}>
        <Image
          style={styles.image}
          source={checked 
            ? require('../../assets/images/check.png')
            : require('../../assets/images/uncheck.png')
          }
        />
      </View>
    </Pressable>
  );
}
