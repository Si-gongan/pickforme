import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
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

  const goToPush = useCallback(
    function () {
      router.push("/push");
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

  const myInfoMenu = useMemo(
    function () {
      const defaultMenu = [{ name: "내 정보 수정하기", onPress: goToInfo }];
      if (!user?._id) {
        return [...defaultMenu, { name: "로그인", onPress: goToLogin }];
      }
      return [
        ...defaultMenu,
        { name: "멤버십 이용하기", onPress: function () {} },
        { name: "멤버십 구매내역", onPress: function () {} },
      ];
    },
    [user?._id, goToInfo, goToLogin]
  );

  const appSettingMenu = useMemo(
    function () {
      const defaultMenu = [
        { name: "화면 모드 변경하기", onPress: function () {} },
      ];
      if (!!user?._id) {
        return [...defaultMenu, { name: "알림 설정하기", onPress: goToPush }];
      }
      return defaultMenu;
    },
    [user?._id, goToPush]
  );

  return (
    <View style={style.MyContainer}>
      <IconHeader title="마이페이지" />
      <View style={style.MyContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={style.MyScrollView}
        >
          {!!user?._id && (
            <MySection
              title="잔여 이용권"
              items={[
                { name: `매니저 질문권 ${user.point ?? 0}회` },
                { name: `AI 질문권 ${user.aiPoint ?? 0}회` },
              ]}
            />
          )}

          <MySection title="내 정보" items={myInfoMenu} />

          <MySection title="앱 설정" items={appSettingMenu} />

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
