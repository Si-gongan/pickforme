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
          <Text style={styles.title}>'상품 설명 받기' 소개</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.page}>총 2페이지 중 1페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          상세페이지에 대체텍스트가 없어 불편했던 적 있었나요?  또는 중고거래 물건 사진을 확인할 수 없어 고민이셨던 적 있었나요? 이제 픽포미가 읽을 수 없던 상세페이지와 궁금했던 상품 사진을 설명해 드릴게요. 
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          홈 화면의 ‘상품 설명 받기’ 버튼을 누르면, 의뢰서 작성 페이지로 이동해요. 의뢰서에 궁금한 상품의 링크와 궁금한 점을 입력해주세요.
          </Text>
        </View>
        <View style={[styles.buttonWrap, styles.buttonRight]}>
          <View style={styles.full}>
            <Button title='다음' onPress={() => router.push('./research2')} />
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
