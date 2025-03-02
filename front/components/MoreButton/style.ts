import { StyleSheet } from "react-native";

export default function useStyle() {
  return StyleSheet.create({
    MoreButton: {
      width: "100%",
      padding: 6,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#d9d9d9",
      alignItems: "center",
      justifyContent: "center",
    },
    MoreButtonText: {
      color: "#1E1E1E",
      fontSize: 12,
      lineHeight: 20,
    },
  });
}
