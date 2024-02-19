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
          <Text style={styles.page}  ref={headerTitleRef}>총 3페이지 중 3페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
5. 마이페이지 탭: 내 정보 수정, 픽 충전, 앱 설정 변경, 고객 지원 기능이 있습니다. ‘내 정보 수정하기’에서는 닉네임과 로그인 정보를 수정할 수 있고, ‘픽 충전하기’에서는 유료 서비스 이용을 위한 픽을 구매할 수 있습니다. ‘앱 설정’에서는 텍스트 크기와 화면 모드, 알림 기능을 설정할 수 있습니다. ‘고객 지원’에서는 카카오톡 채널을 통해 1:1 문의가 가능합니다. 또한 앱 사용 설명서, 자주 묻는 질문을 확인할 수 있습니다.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
지금 바로 픽포미 서비스를 이용해보세요!
          </Text>
        </View>
        <View style={[styles.buttonWrap, styles.buttonLeft]}>
          <View style={styles.full}>
            <Button title='시작하기' onPress={() => router.replace('/')} />
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
