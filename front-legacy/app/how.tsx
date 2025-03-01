import React, { useRef, useCallback } from "react";
import { useRouter, Link } from "expo-router";
import {
  StyleSheet,
  ScrollView,
  Text as TextBase,
  AccessibilityInfo,
  findNodeHandle,
} from "react-native";
import { useFocusEffect } from "@react-navigation/core";

import { Text, View } from "@components";

export default function HowScreen() {
  const router = useRouter();
  const headerTitleRef = useRef<TextBase>(null);
  useFocusEffect(
    useCallback(() => {
      if (headerTitleRef.current) {
        const nodeHandle = findNodeHandle(headerTitleRef.current);
        if (nodeHandle) {
          AccessibilityInfo.setAccessibilityFocus(nodeHandle);
        }
      }
    }, [])
  );
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.title} ref={headerTitleRef}>
              픽포미, 이렇게 사용해 보세요!
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.subtitle}>1. 상품 검색하기</Text>
            <Text style={styles.desc}>
              앱 최상단 검색창을 눌러 원하는 상품을 검색하거나 궁금한 상품의
              링크를 붙여넣어보세요. 상품 링크를 붙여 넣을 경우, 픽포미가 해당
              상세페이지의 내용을 불러와 자동으로 상품의 이미지 설명, 상세페이지
              설명과 리뷰를 요약해 줄거예요. 현재 쿠팡, 11번가, 네이버 쇼핑 상품
              링크를 검색할 수 있어요.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.subtitle}>2. AI에게 질문하기</Text>
            <Text style={styles.desc}>
              궁금한 점이 생기면 상품 상세페이지의 질문하기 탭을 눌러서 픽포미
              AI에게 자유롭게 질문하세요! 픽포미 AI가 빠르고 자세하게 설명해줄
              거에요!
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.subtitle}>3. 매니저에게 질문하기</Text>
            <Text style={styles.desc}>
              궁금한 점이 생기면 매니저 질문하기 버튼을 눌러 상품에 대해 궁금한
              점을 물어보세요. 픽포미 매니저가 한시간에서 두시간 이내로 답변해
              줄거예요. 답변은 위시리스트 탭에서 매니저에게 문의한 상품에서
              확인할 수 있어요.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.desc}>그럼 이제 픽포미를 즐기러 가볼까요?</Text>
          </View>
          <View style={styles.section}>
            <Link href="/(tabs)" accessibilityRole="button">
              <Text style={[styles.desc, styles.link]}>홈으로 이동하기</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 34,
  },
  content: {
    paddingHorizontal: 27,
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    lineHeight: 22,
  },
  subtitle: {
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 15,
  },
  desc: {
    fontSize: 12,
    lineHeight: 15,
  },
  section: {
    marginBottom: 34,
  },
  page: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 17,
  },
  link: {
    textDecorationLine: "underline",
  },
  buttonWrap: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  buttonLeft: {
    justifyContent: "flex-start",
  },
  buttonRight: {
    justifyContent: "flex-end",
  },
  full: {
    flex: 1,
  },
  half: {
    flex: 0.5,
  },
});
