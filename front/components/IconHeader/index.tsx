import { View, Text } from "react-native";

import { MyIcon } from "@assets";
import useStyle from "./style";

import type { IconHeaderProps } from "./type";

export default function IconHeader({ title }: IconHeaderProps) {
  const style = useStyle();

  return (
    <View style={style.IconHeaderContainer}>
      <MyIcon size={30} color="#000" />
      <Text style={style.IconHeaderTitle} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}
