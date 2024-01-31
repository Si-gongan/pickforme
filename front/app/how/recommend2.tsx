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
          <Text style={styles.page}>총 2페이지 중 2페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          작성한 의뢰서는 픽포미 매니저에게 바로 전달됩니다. 2시간 이내로 추천 리포트를 전달해 드려요. 결과 리포트 전송 후 24시간이 지나면, 해당 의뢰에 대한 서비스는 종료됩니다.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          리포트에는 3개의 추천 상품을 알려드려요. 추천 이유와 상품 설명이 자세하게 적혀 있습니다. 픽포미 매니저가 쿠팡 랭킹순과 리뷰를 종합적으로 검토해 최적의 상품 3개를 알려드려요. 리포트에 대해 궁금하신 점이 있을 경우 채팅을 통해 매니저에게 문의해주세요. 
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          지금 상품 추천 받으러 가볼까요?
          </Text>
        </View>
        <View style={styles.section}>
          <View style={[styles.buttonWrap, styles.buttonLeft]}>
            <View style={styles.half}>
              <Button title='작성 예시' color='tertiary' onPress={() => router.push('./example?requestId=recommend1')} />
            </View>
          </View>
        </View>
        <View style={[styles.buttonWrap, styles.buttonLeft]}>
          <View style={styles.full}>
            <Button title='상품 추천 받으러 가기' onPress={() => router.push('/recommend')} />
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
