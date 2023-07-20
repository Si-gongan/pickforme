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
          <Text style={styles.title}>앱 구성 소개</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.page}>총 3페이지 중 2페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          ‘의뢰 목록’ 탭에서는 그동안의 의뢰서들과 결과 리포트를 모아 볼 수 있습니다. 의뢰 한 건당 하나의 채팅방이 개설되어요. 서비스 진행 상황 또한 의뢰 목록 탭에서 확인할 수 있습니다.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
의뢰 시 개설되는 채팅방에서는 의뢰하셨던 내용을 확인할 수 있어요. 의뢰서를 토대로 작성된 결과 리포트 또한 여기서 확인하세요.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
결과 리포트에 대한 추가적인 궁금증이 있다면, 채팅방에 바로 문의를 남겨주세요.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
결과 리포트 전송 후 24시간이 지나면, 해당 의뢰에 대한 서비스는 종료됩니다.
          </Text>
        </View>
        <View style={styles.buttonWrap}>
          <View style={styles.full}>
            <Button title='이전' onPress={() => router.back()} />
          </View>
          <View style={styles.full}>
            <Button title='다음' onPress={() => router.push('./app3')} />
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
