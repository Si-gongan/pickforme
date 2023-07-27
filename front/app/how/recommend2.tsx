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
          <Text style={styles.page}>총 2페이지 중 2페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          선택 이후 원하는 상품의 종류, 가격대, 요구사항을 작성해주시면, 해설진이 2시간 이내로 채팅을 통해 상품 추천 결과를 보내드립니다. 추천 상품의 사이트와 상품 정보(가격, 옵션, 배송)뿐 아니라 추천 사유 및 간단한 제품 소개까지 함께 제공해드립니다.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
이 서비스는 500포인트로 이용하실 수 있으며, 구체적인 요구사항을 적어주시면 더욱 빠르고 자세하게 설명해드립니다. 상품 추천 받기 서비스를 통하여 받으실 수 있는 해설의 예시는 다음과 같습니다.
          </Text>
        </View>
        <View style={styles.section}>
          <View style={[styles.buttonWrap, styles.buttonLeft]}>
            <View style={styles.half}>
              <Button title='상품 추천 예시' color='tertiary' onPress={() => router.back()} />
            </View>
          </View>
        </View>
        <View style={[styles.buttonWrap, styles.buttonLeft]}>
          <View style={styles.half}>
            <Button title='이전' onPress={() => router.back()} />
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
