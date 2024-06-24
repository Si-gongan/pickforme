import { useRouter, Link } from "expo-router";
import React from "react";
import { StyleSheet, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import styles from './styles';


import { useFocusEffect } from '@react-navigation/core';
import { useRef, useCallback } from 'react';
import { Text as TextBase, AccessibilityInfo, findNodeHandle } from 'react-native';

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
          <Text style={styles.title} ref={headerTitleRef}>픽포미, 이렇게 사용해 보세요!</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            1. 상품 검색하기
          </Text>
          <Text style={styles.desc}>
앱 최상단 검색창을 눌러 원하는 상품을 검색하거나 궁금한 상품의 링크를 붙여넣어보세요. 상품 링크를 붙여 넣을 경우, 픽포미가 해당 상세페이지의 내용을 불러와 자동으로 상품의 이미지 설명, 상세페이지 설명과 리뷰를 요약해 줄거예요. 현재 쿠팡, 11번가, 네이버 쇼핑 상품 링크를 검색할 수 있어요.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            2. 상세페이지 설명 받기
          </Text>
          <Text style={styles.desc}>
상품의 상세페이지로 들어가 이미지 설명, 자세한 설명, 리뷰 요약 버튼을 눌러보세요. AI가 사진에 대한 꼼꼼한 설명과 상세페이지 속 글자를 인식해 상품을 자세히 설명해 주고, 등록된 리뷰를 요약해 줄거예요.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subtitle}>
            3. 매니저 질문하기
          </Text>
          <Text style={styles.desc}>
            상품의 상세페이지에서 궁금한 질문이 생기면 매니저 질문하기 버튼을 눌러 상품에 대해 궁금한 점을 물어보세요. 픽포미 매니저가 한시간에서 두시간 이내로 답변해 줄거예요. 답변은 위시리스트 탭에서 매니저에게 문의한 상품에서 확인할 수 있어요.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
            그럼 이제 픽포미 즐기러 가볼까요?
          </Text>
        </View>
        <View style={styles.section}>
          <Link href='/(tabs)' accessibilityRole='button'>
          <Text style={[styles.desc, styles.link]}>
            홈으로 이동하기
          </Text>
          </Link>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
