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
          작성한 의뢰서는 픽포미 매니저에게 바로 전달됩니다. 2시간 이내로 채팅을 통해 결과 리포트를 전달드려요.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          리포트에는 3개 상품의 기본 정보와 자세한 추천 이유가 적혀 있습니다. 작성하신 의뢰서와 결과 리포트에 문의사항이 있을 경우, 채팅을 통해 매니저에게 문의해주세요.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          의뢰서와 리포트의 예시를 보러 가볼까요?
          </Text>
        </View>
        <View style={styles.section}>
          <View style={[styles.buttonWrap, styles.buttonLeft]}>
            <View style={styles.half}>
              <Button title='상품 추천 예시' color='tertiary' onPress={() => router.push('./example?requestId=recommend1')} />
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
