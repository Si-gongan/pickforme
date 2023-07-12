import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';
import { settingAtom, userDataAtom } from '../../../stores/auth/atoms';

import Colors from '../../../constants/Colors';
import { Text, View } from '../../../components/Themed';
import Button from '../../../components/Button';

export default function MyPageScreen() {
  const [userData, setUserData] = useAtom(userDataAtom);
  const setting = useAtomValue(settingAtom);

  const router = useRouter();
  const logout = () => {
    setUserData('' as unknown as undefined);
  }
  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
      <View style={styles.scrollContainer}>
      <Text style={styles.name}>{setting?.name}님 안녕하세요,</Text>
      <View style={styles.card}>
        <Text style={styles.title}>
          내 정보 수정
        </Text>
        <Link href='(settings)/nickname'>
          <Text style={styles.menu}>
            기본 정보 수정
          </Text>
        </Link>
        {!userData && (
          <Button
            variant='text'
            color='tertiary'
            title='로그인'
            size='small'
            style={styles.menu}
            textStyle={styles.buttonText}
            onPress={() => router.push('(auths)/login')}
          />
        )}
      </View>
      {!!userData && (
      <View style={styles.card}>
        <Text style={styles.title}>
          내 픽 {userData.point}픽
        </Text>
        <Link href='/point'>
          <Text style={styles.menu}>
            픽 충전
          </Text>
        </Link>
      </View>
      )}
      <View style={styles.card}>
        <Text style={styles.title}>
          앱 설정
        </Text>
        <Link href='(settings)/theme'>
          <Text style={styles.menu}>
            화면 모드 변경
          </Text>
        </Link>
        <Link href='(settings)/fontSize'>
          <Text style={styles.menu}>
            글자 크기 변경
          </Text>
        </Link>
        <Link href='/(tabs)/mypage/notification'>
          <Text style={styles.menu}>
            알림 설정
          </Text>
        </Link>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>
          고객 지원
        </Text>
        <Text style={styles.menu}>
          1:1 문의
        </Text>
        <Link href='/(tabs)/mypage/how' >
          <Text style={styles.menu}>
            사용 설명서
         </Text>
        </Link>
        <Link href='/faq'>
          <Text style={styles.menu}>
            자주 묻는 질문 (FAQ)
          </Text>
        </Link>
        <Text style={styles.menu}>
          개인정보처리방침
        </Text>
        <Text style={styles.menu}>
          서비스 이용약관
        </Text>
      </View>
      {!!userData && (
        <View style={[styles.card]}>
          <Button
            title='로그아웃'
            variant='text'
            onPress={logout}
            style={[styles.menu, styles.solo]}
            textStyle={styles.buttonText}
            color='tertiary'
            size='small'
          />
        </View>
      )}
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  scrollContainer: {
    paddingVertical: 32,
    paddingHorizontal: 13,
  },
  name: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 31,
    marginHorizontal: 14,
  },
  card: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.light.borderColor.primary,
    borderRadius: 15,
    paddingHorizontal: 14,
    gap: 14,
    paddingVertical: 15,
    marginBottom: 14,
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 4,
  },
  menu: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
    alignItems: 'flex-start',
  },
  solo: {
    marginTop: 0,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  buttonText: {
    fontWeight: '400',
  },
});
