import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import Button from '../components/Button';
import { Text, View } from '../components/Themed';

export default function HowScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView>
      <View style={styles.content}>
        <Text style={styles.title}>FAQ</Text>
        <Text style={styles.desc}>
          질문을 터치해 답을 확인해보세요.
        </Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 34,
  },
  content: {
    paddingHorizontal: 27,
  },
  title: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 34,
    marginBottom: 24, 
  },
  desc: {
    fontSize: 14,
    lineHeight: 17,
  },
  buttonWrap: {
  },
});
