import { TextInput, ScrollView, StyleSheet, Pressable, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { sendChatAtom, requestsAtom } from '../stores/request/atoms';
import { SendChatParams } from '../stores/request/types';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import Chat from '../components/Chat';

const tabName = {
  'RECOMMEND': '픽포미 추천',
  'RESEARCH': '픽포미 분석',
  'BUY': '',
}

export default function ChatScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams();
  const request = useAtomValue(requestsAtom).find(({ _id }) => _id === `${requestId}`);
  if (!request) {
    return <Text>잘못된 접근입니다</Text>
  }
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>
          {tabName[request.type]}
        </Text>
        <Text style={styles.subtitle}>
          의뢰 내용
        </Text>
        <Text style={styles.desc}>
          {request.text}
        </Text>
        <Text style={styles.subtitle}>
          추천 결과
        </Text>
        <Text style={styles.desc}>
          매니저가 답변을 작성중입니다. 조금만 기다려주세요.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 30,
  },
  subtitle: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
    marginBottom: 18,
  },
  desc: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 17,
    marginBottom: 26,
  },
});
