import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import { IconHeader, MySection } from "@components";

export default function MyScreen() {
  const style = useStyle();
  const router = useRouter();

  const goToInfo = useCallback(
    function () {
      router.push("/info");
    },
    [router]
  );

  const goToLogin = useCallback(
    function () {
      router.push("/login");
    },
    [router]
  );

  return (
    <View style={style.MyContainer}>
      <IconHeader title="마이페이지" />
      <View style={style.MyContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={style.MyScrollView}
        >
          <MySection
            title="내 정보"
            items={[
              { name: "내 정보 수정하기", onPress: goToInfo },
              { name: "로그인", onPress: goToLogin },
            ]}
          />
        </ScrollView>
      </View>
    </View>
  );
}

function useStyle() {
  return StyleSheet.create({
    MyContainer: {
      flex: 1,
      backgroundColor: "#fff",
    },
    MyContent: {
      flex: 1,
    },
    MyScrollView: {
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
  });
}
