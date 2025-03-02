import { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { useServiceProductDetail } from "@services";
import { BackHeader } from "@components";

export default function ProductDetailScreen() {
  const { url } = useLocalSearchParams();

  const productUrl = useMemo(
    function () {
      return decodeURIComponent(url?.toString() ?? "");
    },
    [url]
  );

  const style = useStyle();

  const { data } = useServiceProductDetail(productUrl);

  return (
    <View style={style.ProductDetailContainer}>
      <BackHeader />
      <Text>{productUrl}</Text>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
}

export function useStyle() {
  return StyleSheet.create({
    ProductDetailContainer: {
      flex: 1,
    },
  });
}
