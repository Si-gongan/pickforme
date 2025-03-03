import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function useStyle() {
  const insets = useSafeAreaInsets();

  return StyleSheet.create({
    IconHeaderContainer: {
      height: 56 + insets.top,
      paddingTop: insets.top,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingHorizontal: 20,
      gap: 10,
    },
    IconHeaderTitle: {
      fontWeight: "600",
      fontSize: 22,
      lineHeight: 56,
    },
  });
}
