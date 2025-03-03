import { View, Text, TouchableOpacity } from "react-native";

import useStyle from "./style";

import type { IMySectionProps } from "./type";

export default function MySection({ title, items }: IMySectionProps) {
  const style = useStyle();

  return (
    <View style={style.MySectionContainer}>
      {title && <Text style={style.MySectionTitle}>{title}</Text>}
      <View style={style.MySectionMenuContent}>
        {items.map(function (item, index) {
          return (
            <TouchableOpacity
              key={`section-${title}-${index}`}
              onPress={item.onPress}
              disabled={!item.onPress}
            >
              <Text style={style.MySectionMenu}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
