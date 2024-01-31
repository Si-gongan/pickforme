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
          <Text style={styles.page}>총 2페이지 중 2페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          작성한 의뢰서는 픽포미 매니저에게 바로 전달됩니다. 2시간 이내로 설명 리포트를 전달드려요. 결과 리포트 전송 후 24시간이 지나면, 해당 의뢰에 대한 서비스는 종료됩니다.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          리포트에는 기본적으로 상품 디자인, 상세페이지 정보, 리뷰에 대해 설명해드려요. 중고상품의 경우, 사진으로 보이는 상품 상태와 하자여부를 알려드려요. 작성하신 의뢰서와 설명 리포트에 문의사항이 있을 경우, 채팅을 통해 매니저에게 문의해주세요.           </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          의뢰서와 리포트의 예시를 보러 가볼까요?
          </Text>
        </View>
        <View style={styles.section}>
          <View style={styles.buttonWrap}>
            <View style={styles.full}>
              <Button title='일반 상품 예시' color='tertiary' onPress={() => router.push('./example?requestId=research1')} />
            </View>
            <View style={styles.full}>
              <Button title='중고 상품 예시' color='tertiary' onPress={() => router.push('./example?requestId=research2')} />
            </View>
          </View>
        </View>
        <View style={[styles.buttonWrap, styles.buttonLeft]}>
          <View style={styles.full}>
            <Button title='상품 설명 받으러 가기' onPress={() => router.push('/research')} />
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
});
