import { forwardRef } from "react";
import { View as ViewBase, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSetAtom } from "jotai";

import { Text, View } from "@components";
import useStyles from "./style";
import { setProductGroupAtom } from "../../stores/log/atoms";
import { numComma } from "../../utils/common";

import type { IProductCardProps } from "./type";

const ProductCard = forwardRef<ViewBase, IProductCardProps>(
  ({ product, type }, ref) => {
    const router = useRouter();
    const styles = useStyles();

    const setProductGroup = useSetAtom(setProductGroupAtom);

    const handlePress = () => {
      setProductGroup(type);
      router.push(
        `/product-detail?productUrl=${encodeURIComponent(product.url)}`
      );
    };

    if (type === "liked") {
      return (
        <Pressable
          onPress={handlePress}
          accessible
          ref={ref}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} ${numComma(product.price)}원`}
          style={styles.pressable}
        >
          <View style={styles.wrap}>
            <View style={styles.wrap6}>
              <Text numberOfLines={1} style={styles.name} accessible>
                {product.name}
              </Text>
              <Text style={styles.price} accessible>
                {numComma(product.price)}원
              </Text>
            </View>
            <View>{/* like 취소 버튼 */}</View>
          </View>
        </Pressable>
      );
    }
    if (type === "request") {
      return (
        <Pressable
          onPress={handlePress}
          accessible
          ref={ref}
          accessibilityRole="button"
          accessibilityLabel={`${product.name ?? ""} ${numComma(product.price ?? 0)}원`}
          style={styles.pressable}
        >
          <View style={styles.wrap}>
            <Text numberOfLines={2} style={styles.name} accessible>
              {product.name}
            </Text>
            <Text style={styles.price} accessible>
              {numComma(product.price ?? 0)}원
            </Text>
          </View>
        </Pressable>
      );
    }
    if (product.ratings === undefined) {
      return (
        <Pressable
          onPress={handlePress}
          accessible
          ref={ref}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} ${numComma(product.price)}원`}
          style={styles.pressable}
        >
          <View style={styles.wrap}>
            <Text numberOfLines={2} style={styles.name} accessible>
              {product.name}
            </Text>
            <Text style={styles.price} accessible>
              {numComma(product.price ?? 0)}원
            </Text>
          </View>
        </Pressable>
      );
    } else {
      return (
        <Pressable
          onPress={handlePress}
          accessible
          ref={ref}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} ${numComma(product.price)}원 ${(product.discount_rate ?? 0) !== 0 ? `할인률 ${product.discount_rate}%` : ""} 리뷰 ${product.reviews}개 평점 ${Math.floor((product.ratings / 20) * 10) / 10}점`}
          style={styles.pressable}
        >
          <View style={styles.wrap2}>
            <View style={styles.wrap3}>
              <Text style={styles.reviews} accessible>
                리뷰 {product.reviews}개
              </Text>
              <Text style={styles.ratings} accessible>
                평점 {Math.floor((product.ratings / 20) * 10) / 10}점
              </Text>
            </View>
            <View style={styles.wrap4}>
              <Text numberOfLines={1} style={styles.name} accessible>
                {product.name}
              </Text>
              <View style={styles.wrap5}>
                <Text style={styles.discount_rate} accessible>
                  {(product.discount_rate ?? 0) !== 0
                    ? `${product.discount_rate}%`
                    : ""}
                </Text>
                <Text style={styles.price} accessible>
                  {numComma(product.price)}원
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      );
    }
  }
);

export default ProductCard;
