import { StyleSheet } from "react-native";

export default function useStyles() {
  return StyleSheet.create({
    pressable: {
      width: "100%",
    },
    wrap: {
      borderRadius: 4,
      padding: 15,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 20,
      width: "100%",
      backgroundColor: "#F1F1F1",
    },
    name: {
      fontSize: 12,
      color: "#1E1E1E",
      fontWeight: "500",
      lineHeight: 20,
      flex: 1,
    },
    price: {
      fontSize: 12,
      lineHeight: 14.52,
      color: "#1E1E1E",
      fontWeight: "700",
    },
    wrap2: {
      borderRadius: 4,
      padding: 15,
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-start",
      width: "100%",
      backgroundColor: "#F1F1F1",
    },
    wrap3: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 6,
      backgroundColor: "#F1F1F1",
    },
    wrap4: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      backgroundColor: "#F1F1F1",
    },
    wrap5: {
      flexDirection: "row",
      gap: 6,
      backgroundColor: "#F1F1F1",
    },
    wrap6: {
      flex: 1,
      flexDirection: "column",
      backgroundColor: "#F1F1F1",
      gap: 6,
    },
    reviews: {
      fontSize: 12,
      color: "#1E1E1E",
      fontWeight: "bold",
    },
    ratings: {
      fontSize: 12,
      color: "#1E1E1E",
      fontWeight: "bold",
    },
    discount_rate: {
      fontSize: 12,
      color: "#4A5CA0",
      fontWeight: "bold",
    },
  });
}
