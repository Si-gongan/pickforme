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
          <Text style={styles.title}>'상품 추천 받기' 소개</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.page}>총 2페이지 중 1페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          쇼핑할 때 내가 딱 원하는 상품을 찾을 수 없어 곤란했던 적 있으셨나요? 이제 픽포미가 당신의 요구사항에 맞는 최적의 상품 3개를 직접 찾아 드릴게요.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          홈 화면의 ‘상품 추천 받기’ 버튼을 누르면, 의뢰서 작성 페이지로 이동합니다. 의뢰서에 어떤 상품을 원하는지를 가격대와 함께 작성해주세요. 원하는 성능, 디자인, 브랜드 등 조건을 자세하게 작성해주시면 더욱 정확한 상품 추천이 가능해요. 
          </Text>
        </View>
        <View style={[styles.buttonWrap, styles.buttonRight]}>
          <View style={styles.full}>
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
