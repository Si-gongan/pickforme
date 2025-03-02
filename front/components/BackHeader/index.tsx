import { useCallback } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

import { BackImage } from "@assets";
import useStyle from "./style";

export default function BackHeader() {
  const router = useRouter();
  const style = useStyle();

  const onPress = useCallback(
    function () {
      if (router.canGoBack()) {
        router.back();
      }
    },
    [router]
  );

  return (
    <View style={style.BackHeader}>
      <TouchableOpacity
        style={style.BackHeaderButton}
        onPress={onPress}
        accessible
        accessibilityRole="button"
        accessibilityLabel="뒤로가기"
      >
        <Image style={style.BackHeaderImage} source={BackImage} />
      </TouchableOpacity>
    </View>
  );
}
