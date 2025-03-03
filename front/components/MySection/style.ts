import { StyleSheet } from "react-native";

export default function useStyle() {
  return StyleSheet.create({
    MySectionContainer: {
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "#9FA7C3",
      borderRadius: 10,
      paddingHorizontal: 14,
      gap: 14,
      paddingVertical: 15,
      marginBottom: 14,
    },
    MySectionMenuContent: {
      gap: 14,
    },
    MySectionTitle: {
      fontWeight: "600",
      fontSize: 18,
      lineHeight: 22,
      marginBottom: 4,
    },
    MySectionMenu: {
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 17,
      alignItems: "flex-start",
    },
  });
}
