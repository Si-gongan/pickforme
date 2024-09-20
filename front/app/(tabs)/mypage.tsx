import { useCallback, useRef } from 'react';
import { Text as TextBase, AccessibilityInfo, ScrollView, findNodeHandle, StyleSheet, Pressable, Alert, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { settingAtom, userDataAtom, quitAtom, logoutAtom } from '../../stores/auth/atoms';
import { useFocusEffect } from '@react-navigation/core';

import Colors from '../../constants/Colors';
import { Text, View } from '../../components/Themed';
import Button from '../../components/Button';
import useColorScheme, { ColorScheme } from '../../hooks/useColorScheme';
import * as WebBrowser from 'expo-web-browser';

import MypageIcon from '../../assets/images/tabbar/mypage.svg';

export default function MyPageScreen() {
  const [userData, setUserData] = useAtom(userDataAtom);
  const setting = useAtomValue(settingAtom);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const headerTitleRef = useRef<TextBase>(null);

  useFocusEffect(
    useCallback(() => {
      const f = () => {
        if (headerTitleRef.current) {
          const nodeHandle = findNodeHandle(headerTitleRef.current);
          if (nodeHandle) {
            AccessibilityInfo.setAccessibilityFocus(nodeHandle);
          }
        }
      }
      setTimeout(f, 500);
    }, [])
  );

  const quit = useSetAtom(quitAtom);
  const logout = useSetAtom(logoutAtom);
  const router = useRouter();
  const handleClickQuit = () => {
    Alert.alert(
      '정말 탈퇴하시겠습니까?',
      '모든 계정 정보가 삭제됩니다',
      [
        {
          text: '탈퇴',
          onPress: quit,
          style: 'destructive',
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
      },
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MypageIcon style={styles.icon} />
        <Text style={styles.headerTitle} ref={headerTitleRef} accessibilityRole='header'>마이페이지</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.scrollContainer}>
          <View style={styles.card}>
            <Text style={styles.title}>
              내 정보
            </Text>
            <Link href='/(settings)/nickname' accessibilityRole='button'>
              <Text style={styles.menu}>
                내 정보 수정하기
              </Text>
            </Link>

            {!userData ? (
              <Button
                variant='text'
                color='tertiary'
                title='로그인'
                size='small'
                style={styles.menu}
                textStyle={styles.buttonText}
                onPress={() => router.push('(auths)/login')}
              />) :
              (<>
                {/* <Link href='/purchase' accessibilityRole='button'>
                  <Text style={styles.menu}>
                    이용권 충전하기
                  </Text>
                </Link>
                <Link href='/purchase-history' accessibilityRole='button'>
                  <Text style={styles.menu}>
                    이용권 구매내역
                  </Text>
                </Link> */}
                <Link href='/subscription' accessibilityRole='button'>
                  <Text style={styles.menu}>
                    멤버십 이용하기
                  </Text>
                </Link>
                <Link href='/subscription-history' accessibilityRole='button'>
                  <Text style={styles.menu}>
                    멤버십 구매내역
                  </Text>
                </Link>
              </>)
            }
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>
              앱 설정
            </Text>
            <Link href='/(settings)/theme' accessibilityRole='button'>
              <Text style={styles.menu}>
                화면 모드 변경하기
              </Text>
            </Link>
            {!!userData && (
              <Link href='/(settings)/notification' accessibilityRole='button'>
                <Text style={styles.menu}>
                  알림 설정하기
                </Text>
              </Link>
            )}
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>
              고객 지원
            </Text>
            <Button
              title='1:1 문의'
              variant='text'
              onPress={() => WebBrowser.openBrowserAsync('http://pf.kakao.com/_csbDxj')}
              style={[styles.menu, styles.solo]}
              textStyle={styles.buttonText}
              color='tertiary'
              size='small'
            />
            <Link href='/how' accessibilityRole='button'>
              <Text style={styles.menu}>
                사용 설명서
              </Text>
            </Link>
            <Link href='/faq' accessibilityRole='button'>
              <Text style={styles.menu}>
                자주 묻는 질문
              </Text>
            </Link>
            <Button
              title='개인정보처리방침'
              variant='text'
              onPress={() => WebBrowser.openBrowserAsync('https://sites.google.com/view/sigongan-useterm/개인정보처리방침?authuser=0')}
              style={[styles.menu, styles.solo]}
              textStyle={styles.buttonText}
              color='tertiary'
              size='small'
            />
            <Button
              title='서비스 이용약관'
              variant='text'
              onPress={() => WebBrowser.openBrowserAsync('https://sites.google.com/view/sigongan-useterm/홈?authuser=0')}
              style={[styles.menu, styles.solo]}
              textStyle={styles.buttonText}
              color='tertiary'
              size='small'
            />
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
              <Button
                title='회원탈퇴'
                variant='text'
                onPress={handleClickQuit}
                style={[styles.menu, styles.solo]}
                textStyle={[styles.buttonText, styles.red]}
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

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  name: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 31,
  },
  card: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors[colorScheme].borderColor.secondary,
    borderRadius: 10,
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
  red: {
    color: '#EA4335',
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  icon: {
    color: Colors[colorScheme].text.primary,
    marginRight: 9,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 27,
    marginBottom: 13,
  }
});
