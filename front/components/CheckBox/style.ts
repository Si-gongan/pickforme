import { StyleSheet } from "react-native";

import { useColorScheme } from "../../hooks/useColorScheme";
import Colors from "../../constants/Colors";

export default function useStyles() {
  const colorScheme = useColorScheme();

  return StyleSheet.create({
    wrap: {
      // borderWidth: 1,
      // borderColor: Colors[colorScheme].buttonBackground.secondary,
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    checked: {
      backgroundColor: 'white',
    },
    image: {
      width: 20,
      height: 20,
    },
  });
}
