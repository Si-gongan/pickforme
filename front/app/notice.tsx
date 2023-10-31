import { ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { formatDate, formatTime, numComma } from '../utils/common';
import { noticesAtom } from '../stores/notice/atoms';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';

export default function RequestScreen() {
  const router = useRouter();
  const { noticeId } = useLocalSearchParams();
  const notice = useAtomValue(noticesAtom).find(({ _id }) => _id === `${noticeId}`);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  if (!notice) {
    return <Text>잘못된 접근입니다</Text>
  }


  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>
          {notice.title}
        </Text>
        <Text style={styles.date} color='secondary'>
          {`${formatDate(notice.createdAt)} ${formatTime(notice.createdAt)}`}
        </Text>
        <Text style={styles.desc}>
          {notice.text}
        </Text>
      </ScrollView>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    lineHeight: 24,
  },
  date: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 32,
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
  },
});
