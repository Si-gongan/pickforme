import { Pressable, Text } from "react-native";

import useStyle from "./style";

import type { IMoreButtonProps } from "./type";

export default function MoreButton({ onPress }: IMoreButtonProps) {
  const style = useStyle();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="상품 더보기"
      accessible
      style={style.MoreButton}
    >
      <Text style={style.MoreButtonText}>상품 더보기</Text>
    </Pressable>
  );
}
