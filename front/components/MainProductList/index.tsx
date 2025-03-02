/**
 * 홈 화면 메인 상품 노출
 * - 기본적으로 랜덤 카테고리 상품 노툴
 */
import { useState, useCallback } from "react";
import { ScrollView, FlatList, View, Text } from "react-native";

import { ProductCard, MoreButton } from "@components";
import { useServiceMainProducts } from "@services";
import useStyle from "./style";

export default function MainProductList() {
  const [randomCount, onRandomCount] = useState<number>(10);
  const [specialCount, onSpecialCount] = useState<number>(15);

  const { data, category } = useServiceMainProducts();

  const style = useStyle();

  const onMore = useCallback(
    function (type: "special" | "random") {
      switch (type) {
        case "special":
          onSpecialCount(function (prev) {
            return Math.min(prev + 5, data.special.length);
          });
          break;
      }
    },
    [data]
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {data.local
        .filter(function ({ order }) {
          return order < 0;
        })
        .sort(function (a, b) {
          return a.order - b.order;
        })
        .map(function (item) {
          return (
            <View
              style={style.MainProductSection}
              key={`discover-main-section-${item.name}-${item.order}`}
            >
              <Text
                style={[style.MainProductSectionTitle]}
                accessible
                accessibilityRole="header"
              >
                {item.name}
              </Text>
            </View>
          );
        })}

      {data.random.length > 0 && (
        <View style={style.MainProductSection}>
          <Text
            style={[style.MainProductSectionTitle]}
            accessible
            accessibilityRole="header"
          >
            {category}
          </Text>

          <FlatList
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={[style.MainProductSectionListContent]}
            data={data.random.slice(0, randomCount)}
            keyExtractor={function (item) {
              return `random-${item.url}`;
            }}
            ItemSeparatorComponent={() => (
              <View
                style={style.MainProductSectionSeparator}
                accessible={false}
              />
            )}
            renderItem={function ({ item }) {
              return <ProductCard data={item} />;
            }}
            ListFooterComponentStyle={style.MainProductSectionListFooter}
            ListFooterComponent={function () {
              return (
                data.random.length > randomCount && (
                  <MoreButton
                    onPress={function () {
                      onMore("random");
                    }}
                  />
                )
              );
            }}
          />
        </View>
      )}

      {data.special.length > 0 && (
        <View style={style.MainProductSection}>
          <Text
            style={[style.MainProductSectionTitle]}
            accessible
            accessibilityRole="header"
          >
            오늘의 특가
          </Text>

          <FlatList
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={[style.MainProductSectionListContent]}
            data={data.special.slice(0, specialCount)}
            keyExtractor={function (item) {
              return `special-${item.url}`;
            }}
            ItemSeparatorComponent={() => (
              <View
                style={style.MainProductSectionSeparator}
                accessible={false}
              />
            )}
            renderItem={function ({ item }) {
              return <ProductCard data={item} />;
            }}
            ListFooterComponentStyle={style.MainProductSectionListFooter}
            ListFooterComponent={function () {
              return (
                data.special.length > specialCount && (
                  <MoreButton
                    onPress={function () {
                      onMore("special");
                    }}
                  />
                )
              );
            }}
          />
        </View>
      )}
    </ScrollView>
  );
}
