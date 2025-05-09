import { View, StyleSheet } from "react-native";

import { BackHeader } from "@components";
import useColorScheme from "../hooks/useColorScheme";
import Colors from "../constants/Colors";

export default function ModeScreen() {
  const colorScheme = useColorScheme();
  const style = useStyle(colorScheme);

  return (
    <View style={style.ModeScreenContainer}>
      <BackHeader />
      <View></View>
    </View>
  );
}

function useStyle(colorScheme: ReturnType<typeof useColorScheme>) {
  const theme = Colors[colorScheme];
  return StyleSheet.create({
    ModeScreenContainer: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
  });
}
