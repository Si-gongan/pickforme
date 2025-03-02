import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function useStyle() {
  const insets = useSafeAreaInsets();

  return StyleSheet.create({
    BackHeader: {
      height: 56 + insets.top,
      paddingTop: insets.top,
    },
    BackHeaderButton: {
      width: 56,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
    },
    BackHeaderImage: {
      width: 28,
      height: 28,
    },
  });
}
