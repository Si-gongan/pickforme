import { forwardRef, useCallback, useMemo } from "react";
import { Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";

import { getNumberComma } from "@utils";
import useStyle from "./style";

import type { ForwardedRef } from "react";
import type { IProductCardProps } from "./type";

export default forwardRef(function ProductCard(
  { data, type }: IProductCardProps,
  ref: ForwardedRef<View>
) {
  const router = useRouter();
  const styles = useStyle();

  const isBase = useMemo(
    function () {
      return !["liked", "request"].includes(type) && !!data.ratings;
    },
    [type, data]
  );

  const label = useMemo(
    function () {
      const mainLabel = `${data.name ?? ""} ${getNumberComma(
        data.price ?? 0
      )}원`;

      if (isBase) {
        return `${mainLabel} ${
          (data.discount_rate ?? 0) !== 0 ? `할인률 ${data.discount_rate}%` : ""
        } 리뷰 ${data.reviews}개 평점 ${
          Math.floor((data.ratings / 20) * 10) / 10
        }점`;
      }

      return mainLabel;
    },
    [isBase, data]
  );

  const onPress = useCallback(function () {
    router.push(`/product-detail?productUrl=${encodeURIComponent(data.url)}`);
  }, []);

  return (
    <Pressable
      ref={ref}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.ProductCard}
      onPress={onPress}
    >
      <View
        style={[
          styles.ProductCardContent,
          isBase && styles.ProductCardContentColumn,
        ]}
      >
        {!isBase && (
          <View style={styles.ProductCardContentRow}>
            <Text
              numberOfLines={type === "liked" || isBase ? 1 : 2}
              style={styles.ProductCardName}
              accessible
            >
              {data.name}
            </Text>
            <Text style={styles.ProductCardPrice} accessible>
              {getNumberComma(data.price ?? 0)}원
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});
