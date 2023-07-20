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
          <Text style={styles.title}>'픽포미 추천' 소개</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.page}>총 2페이지 중 1페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          복잡한 온라인 쇼핑몰에서 내가 딱 원하는 상품을 찾기 어려우셨나요? 고객님의 요구사항에 맞는 최적의 상품 3개를 매니저가 직접 찾아 드립니다.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
홈 화면의 픽포미 추천 버튼을 누르면, 의뢰서 작성 페이지로 이동할 수 있습니다. 의뢰서에는 찾고 싶은 상품에 대한 설명을 적어주세요. 원하는 성능, 디자인, 가격대, 브랜드 등 다양한 조건을 제시하셔도 좋습니다.
          </Text>
        </View>
        <View style={[styles.buttonWrap, styles.buttonRight]}>
          <View style={styles.half}>
            <Button title='다음' onPress={() => router.push('./recommend2')} />
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
