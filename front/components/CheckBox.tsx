import React from "react";
import { StyleSheet, Image, Pressable } from 'react-native';
import { View } from './Themed';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import Colors from '../constants/Colors';


export type CheckBoxProps = {
  checked: boolean;
  onPress: () => void;
};

function CheckBox({
  checked,
  onPress,
}: CheckBoxProps) {
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  return (
    <Pressable
      onPress={onPress}
      >
    <View
      style={[styles.wrap, checked && styles.checked]}
    >
      <Image style={styles.image} source={require('../assets/images/check.png')} />
    </View>
    </Pressable>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({

  wrap: {
    borderWidth: 1,
    borderColor: Colors[colorScheme].buttonBackground.secondary,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: Colors[colorScheme].buttonBackground.secondary,
  },
  image: {
    width: 13.774,
    height: 9.968,
  },
});

export default CheckBox;
