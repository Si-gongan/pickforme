import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import Button from '../../../../components/Button';
import { Text, View } from '../../../../components/Themed';
import styles from './styles';

export default function HowScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>앱 구성 소개</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.page}>총 3페이지 중 1페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          앱 화면 하단에는 홈, AI 포미, 의뢰 목록, 마이페이지 4개의 탭이 있습니다. 탭을 터치하면 각 화면으로 이동됩니다.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
홈 탭에서는 ‘픽포미 추천’, ‘픽포미 분석’, ‘픽포미 구매’ ,‘AI 구매’를 이용할 수 있습니다. ‘픽포미 추천’과 ‘픽포미 분석’ 버튼을 클릭하면 의뢰서 작성 화면으로 이동하고, ‘AI 포미’ 버튼을 클릭하면 포미와의 채팅방으로 이동합니다.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
AI 포미 탭에서는 쇼핑을 돕는 인공지능, 포미와 대화할 수 있습니다. 포미에게 원하는 상품에 대해 말해주고 똑똑한 상품 추천을 받아보세요!
          </Text>
        </View>
        <View style={[styles.buttonWrap, styles.buttonRight]}>
          <View style={styles.half}>
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
