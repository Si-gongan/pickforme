import { StyleSheet } from "react-native";

export default function useStyle() {
  return StyleSheet.create({
    SelectButtonContainer: {
      flexDirection: "row",
      gap: 20,
      flex: 1,
      justifyContent: "flex-start",
    },
    SelectButton: {
      width: 70,
      height: 52,
      paddingVertical: 0,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 6,
    },
    SelectButtonActive: {
      backgroundColor: "#111E4F",
    },
    SelectButtonText: {
      fontSize: 14,
      lineHeight: 16, // ASIS 14
      textAlign: "center",
      fontWeight: "600",
    },
    SelectButtonTextActive: {
      color: "#fff",
    },
  });
}
