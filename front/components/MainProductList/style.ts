import { StyleSheet } from "react-native";

export default function useStyle() {
  return StyleSheet.create({
    MainProductSection: {
      marginBottom: 60,
    },
    MainProductSectionTitle: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 23,
    },
    MainProductSectionListContent: {
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 36,
    },
    MainProductSectionSeparator: {
      height: 12,
      width: 1,
      backgroundColor: "transparent",
    },
    MainProductSectionListFooter: {
      width: "100%",
      marginTop: 12,
    },
  });
}
