import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import styles from './styles';

export default function HowScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>'픽포미 분석' 소개</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.page}>총 2페이지 중 1페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          온라인 쇼핑몰에 대체텍스트가 없어 불편하셨나요? 중고거래 물건 사진이 제대로 보이지 않아 고민이셨나요? 궁금했던 상품 사진, 읽기 힘들었던 상세페이지 정보를 픽포미 매니저가 대신 꼼꼼히 정리해드립니다.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
홈 화면의 픽포미 분석 버튼을 누르면, 의뢰서 작성 페이지로 이동할 수 있습니다. 의뢰서에는 궁금한 상품의 링크와 추가 요청사항을 입력해주세요.
          </Text>
        </View>
        <View style={[styles.buttonWrap, styles.buttonRight]}>
          <View style={styles.half}>
            <Button title='다음' onPress={() => router.push('./research2')} />
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
