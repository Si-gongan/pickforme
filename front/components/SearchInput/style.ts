import { StyleSheet } from "react-native";

export default function useStyle() {
  return StyleSheet.create({
    SearchInputContainer: {
      position: "relative",
    },
    SearchInput: {
      borderColor: "#5F5F5F",
      borderWidth: 1,
      height: 47,
      borderRadius: 8,
      paddingLeft: 12,
      paddingRight: 78,
      fontSize: 14,
    },
    SearchInputCloseButton: {
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      right: 42,
      top: 0,
      width: 36,
      height: 47,
    },
    SearchInputCloseImage: {
      width: 24,
      height: 24,
    },
    SearchInputSendButton: {
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      right: 0,
      top: 0,
      width: 42,
      height: 47,
    },
    SearchInputSendImage: {
      width: 20,
      height: 20,
    },
  });
}
