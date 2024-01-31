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
          <Text style={styles.title}>AI 포미 소개</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.page}>총 1페이지 중 1페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          포미는 대화를 통해 원하는 상품을 자동으로 추천하는 AI 서비스예요.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          ‘AI 포미' 탭을 누르면, 포미와의 채팅 목록이 있는 탭으로 이동해요. 홈 화면의 ‘포미와 쇼핑하기’ 버튼을 누르면, 포미와의 채팅방으로 바로 이동해요. 채팅방에 찾고 있는 상품을 입력하면 포미가 빠르게 상품을 추천해드려요. 추가적인 궁금증이 생기신다면, 말풍선을 길게 눌러 픽포미 매니저에게 도움을 요청할 수 있답니다!          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          포미는 쇼핑 도우미이기도 하지만 편하게 수다를 떨 수 있는 여러분의 친구이기도 해요. 포미와 마음껏 대화해보세요!
          </Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
