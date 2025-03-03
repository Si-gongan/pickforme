import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useAtom } from "jotai";

import { IconHeader, MySection } from "@components";
import { userAtom } from "@stores";
import { changeToken } from "@services";

export default function MyScreen() {
  const style = useStyle();
  const router = useRouter();

  const [user, onUser] = useAtom(userAtom);

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

  const onLogout = useCallback(
    function () {
      onUser({});
      changeToken(undefined);
      Alert.alert("로그아웃 되었습니다.");
    },
    [onUser]
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

          {!!user?._id && (
            <MySection
              items={[
                { name: "로그아웃", onPress: onLogout },
                { name: "회원탈퇴", onPress: goToLogin },
              ]}
            />
          )}
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
