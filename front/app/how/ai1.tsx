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
          <Text style={styles.title}>AI 서비스, 포미 소개</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.page}>총 1페이지 중 1페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          포미는 대화를 통해 원하는 상품을 자동으로 추천하고 분석하는 AI예요!
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
AI 포미 탭을 누르면, 포미와의 채팅방으로 이동할 수 있어요. 채팅방에 찾고 있는 상품과 원하는 조건을 입력하시면, 포미가 최적의 추천을 해드려요. 원하시는 쿠팡 상품 링크를 채팅에 입력해보세요. 포미가 자동으로 링크를 분석해 상품에 대해 자세히 설명해드려요!
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
포미는 쇼핑 도우미이기도 하지만, 편하게 수다를 떨 수 있는 여러분의 친구이기도 해요. 포미와 마음껏 대화해보세요!
          </Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
