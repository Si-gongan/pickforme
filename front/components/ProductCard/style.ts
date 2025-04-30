import { StyleSheet } from "react-native";

export default function useStyle() {
  return StyleSheet.create({
    ProductCard: {
      width: "100%",
    },
    ProductCardContent: {
      borderRadius: 4,
      padding: 15,
      flexDirection: "row",
      gap: 20,
      alignItems: "flex-end",
      justifyContent: "space-between",
      width: "100%",
      backgroundColor: "#F1F1F1",
    },
    ProductCardContentColumn: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 0,
    },
    ProductCardContentRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 6,
      backgroundColor: "#F1F1F1",
    },
    ProductCardName: {
      fontSize: 12,
      color: "#1E1E1E",
      fontWeight: "500",
      lineHeight: 20,
      flex: 1,
    },
    ProductCardPrice: {
      fontSize: 12,
      lineHeight: 14.52,
      color: "#1E1E1E",
      fontWeight: "700",
    },
    ProductCardDiscount: {
      fontSize: 11,
      lineHeight: 14,
      color: "#FF4545",
      fontWeight: "500",
      marginLeft: 5,
    },
  });
}
