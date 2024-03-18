import { useRouter } from "expo-router";
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
          <Text style={styles.title} ref={headerTitleRef}>앱 구성 소개</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.page}>총 3페이지 중 1페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          앱 화면 하단에는 총 5개의 탭이 있어요. 왼쪽부터 홈, 탐색, AI 포미, 의뢰 목록, 마이페이지예요. 
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          1. 홈 탭: ‘상품 검색하기', ‘상품 추천 받기’, 상품 설명 받기’ 버튼이 있어요. ‘상품 검색하기' 버튼을 누르면 탑색 탭의 상품 검색창으로 바로 이동해요. ‘상품 추천 받기’와 ‘상품 설명 받기’를 누르면 의뢰서 작성 화면으로 이동해요.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
2. 탐색 탭: 상품을 검색하거나 추천 상품과 특가 상품을 볼 수 있어요. 상품 검색 결과는 쿠팡 추천 기준으로 노출됩니다.
          </Text>
        </View>
        <View style={[styles.buttonWrap, styles.buttonRight]}>
          <View style={styles.full}>
            <Button title='다음' onPress={() => router.push('./app2')} />
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
