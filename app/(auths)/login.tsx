import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet } from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';

import * as KakaoLogins from "@react-native-seoul/kakao-login";
import * as AppleAuthentication from 'expo-apple-authentication';

import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import {
  loginKakaoAtom,
  loginAppleAtom,
  userDataAtom,
} from '../../stores/auth/atoms';

export default function RegisterScreen() {
  const loginKakao = useSetAtom(loginKakaoAtom);
  const loginApple = useSetAtom(loginAppleAtom);
  const userData = useAtomValue(userDataAtom);
  const router = useRouter();

  React.useEffect(() => {
    if (userData) {
      router.replace('/(tabs)');
    }
  }, [userData]);
  if (userData) {
    return null;
  }
  const loginWithKakao = async () => {
    const token = await KakaoLogins.login();  
    loginKakao({ accessToken: token.accessToken });
  }

  const loginWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { identityToken } = credential;
      if (identityToken) {
        loginApple({ identityToken });
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>로그인하면 픽포미의 모든</Text>
        <Text style={styles.title}>서비스를 이용할 수 있어요!</Text>
      </View>
      <View style={styles.buttonWrap}>
        <Button
          title='카카오로 시작하기'
          onPress={loginWithKakao}
          style={[styles.button, styles.kakaoButton]}
          textStyle={[styles.buttonText, styles.kakaoButtonText]}
        >
          <Image style={styles.icon} source={require('../../assets/images/auth/kakao.png')} />
        </Button>
        <View style={styles.button}>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={15}
          style={styles.appleButton}
          onPress={loginWithApple}
        />
        </View>
        <Button
          title='구글로 시작하기'
          onPress={loginWithKakao}
          style={[styles.button, styles.googleButton]}
          textStyle={[styles.buttonText, styles.googleButtonText]}
        >
          <Image style={styles.icon} source={require('../../assets/images/auth/kakao.png')} />
        </Button>
      </View>
      <View style={styles.descWrap}>
        <Text style={styles.desc}>픽포미에 첫 회원가입하고</Text>
        <Text style={styles.desc}>무료로 2000 포인트를 획득하세요!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleWrap: {
    marginBottom: 46,
  },
  buttonWrap: {
    width: '100%',
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 23,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 22,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
  },
  kakaoButtonText: {
    color: '#3B2929',
  },
  appleButton: {
    width: '100%',
    height: 57,
  },
  appleButtonText: {
    color: '#EFEFEF',
  },
  googleButton: {
    backgroundColor: '#F2F2F2',
  },
  googleButtonText: {
    color: '#6F6F6F',
  },
  icon: {
    width: 31,
    height: 30,
    marginRight: 15,
  },
  descWrap: {
    marginTop: 30,
  },
  desc: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
  },
});
