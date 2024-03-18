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
          <Text style={styles.title}>앱 구성 소개</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.page}>총 3페이지 중 2페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}  ref={headerTitleRef}>
3. AI 포미 탭: 쇼핑을 돕는 인공지능 AI 포미와 대화할 수 있어요. 원하는 상품을 설명하고 상품 추천을 빠르게 받아보세요.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
4. 의뢰 목록 탭: 총 2개의 버튼으로 구성되어 있어요. 의뢰 리포트, 전체 상품 목록 버튼이에요. ‘의뢰 리포트’ 버튼을 활성화하면 내가 의뢰한 리포트를 전부 볼 수 있어요. 의뢰 진행 상황도 확인할 수 있고요. ‘전체 상품 목록’ 버튼을 활성화하면 픽포미 매니저가 추천한 상품들이 전부 저장돼있어요.
          </Text>
        </View>
        <View style={styles.buttonWrap}>
          <View style={styles.full}>
            <Button title='다음' onPress={() => router.push('./app3')} />
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
