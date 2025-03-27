import { StyleSheet } from "react-native";

export default function useStyle() {
  return StyleSheet.create({
    MainProductSection: {
      marginBottom: 60,
    },
    MainProductSectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 23,
      color:"#111E4F"
    },
    MainProductSectionListContent: {
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 36,
      color:"#111E4F"
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
