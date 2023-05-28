import { ScrollView, StyleSheet, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { userDataAtom } from '../../stores/auth/atoms';

import Colors from '../../constants/Colors';
import { Text, View } from '../../components/Themed';
import Button from '../../components/Button';


export default function MyPageScreen() {
  const [userData, setUserData] = useAtom(userDataAtom);
  const router = useRouter();
  const logout = () => {
    setUserData(undefined);
  }
  return (
    <View style={styles.container}>
      <ScrollView>
      <View style={styles.card}>
        <Text style={styles.title}>
          내 정보 수정
        </Text>
        <Text style={styles.menu}>
          <Link href='(settings)/nickname'>
            기본 정보 수정
          </Link>
        </Text>
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
          내 포인트 {userData.point}p
        </Text>
        <Text style={styles.menu}>
          <Link href='/point'>
            포인트 충전
          </Link>
        </Text>
      </View>
      )}
      <View style={styles.card}>
        <Text style={styles.title}>
          앱 설정
        </Text>
        <Text style={styles.menu}>
          <Link href='(settings)/theme'>
            화면 모드 변경
          </Link>
        </Text>
        <Text style={styles.menu}>
          <Link href='(settings)/fontSize'>
            글자 크기 변경
          </Link>
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>
          고객 지원
        </Text>
        <Text style={styles.menu}>
          1:1 문의
        </Text>
        <Text style={styles.menu}>
          사용 설명서
        </Text>
        <Text style={styles.menu}>
          자주 묻는 질문 (FAQ)
        </Text>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  card: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.light.borderColor.primary,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 15,
    marginHorizontal: 13,
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
    marginTop: 14,
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
