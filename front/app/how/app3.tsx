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
          <Text style={styles.page}>총 3페이지 중 3페이지</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
          마이페이지 탭에는 내 정보 수정, 포인트 충전, 앱 설정 변경, 고객 지원 기능이 있습니다. ‘내 정보 수정’에서는 닉네임과 로그인 정보를 수정할 수 있고, ‘포인트 충전’에서는 유료 서비스 이용을 위한 포인트를 구매할 수 있습니다. ‘앱 설정’에서는 화면 모드, 알림 기능을 설정할 수 있습니다.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
‘고객 지원’에서는 픽포미를 만든 ‘팀 시공간’에게 카카오톡 채널을 통해 1:1 문의가 가능합니다. 또한 앱 사용 설명서, 자주 묻는 질문을 확인할 수 있습니다.
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.desc}>
지금 바로 픽포미 서비스를 이용해보세요!
          </Text>
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
