import { View, StyleSheet } from "react-native";

import { BackHeader } from "@components";

export default function ModeScreen() {
  const style = useStyle();

  return (
    <View style={style.ModeScreenContainer}>
      <BackHeader />
      <View></View>
    </View>
  );
}

function useStyle() {
  return StyleSheet.create({
    ModeScreenContainer: {
      flex: 1,
      backgroundColor: "#fff",
    },
  });
}
