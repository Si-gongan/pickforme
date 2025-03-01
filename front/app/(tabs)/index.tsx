import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchInput, MainProductList } from "@components";

export default function HomeScreen() {
  const style = useStyle();

  return (
    <View style={style.Container}>
      <View style={style.Header}>
        <SearchInput placeholder="찾고 싶은 상품 키워드 또는 링크를 입력해 보세요" />
      </View>

      <MainProductList />
    </View>
  );
}

function useStyle() {
  const insets = useSafeAreaInsets();

  return StyleSheet.create({
    Container: {
      flex: 1,
      backgroundColor: "#fff",
      paddingHorizontal: 12,
    },
    Header: {
      paddingTop: insets.top,
      height: 47 + insets.top,
    },
  });
}
