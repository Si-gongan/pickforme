/**
 * 홈 화면 메인 상품 노출
 * - 기본적으로 랜덤 카테고리 상품 노툴
 */
import { ScrollView, FlatList, View, Text } from "react-native";

import { ProductCard } from "@components";
import { useServiceMainProducts } from "@services";
import useStyle from "./style";

export default function MainProductList() {
  const { data } = useServiceMainProducts();

  const style = useStyle();

  return (
    <ScrollView>
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
            scrollEnabled={false}
            contentContainerStyle={[style.MainProductSectionListContent]}
            // data={data.special.slice(0, length.special)}
            data={data.special}
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
              return <ProductCard data={item} type="goldbox" />;
            }}
            // ListFooterComponentStyle={styles.listFooter}
            // ListFooterComponent={
            //   data.special.length > length.special
            //     ? () => (
            //         <MoreButton onClick={() => handleClickMore("special")} />
            //       )
            //     : undefined
            // }
          />
        </View>
      )}
    </ScrollView>
  );
}
