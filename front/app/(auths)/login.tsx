import { usePathname, useRouter } from "expo-router";
import React from "react";
import { ViewProps, Platform, Image, StyleSheet } from 'react-native';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as KakaoLogins from "@react-native-seoul/kakao-login";
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';

import Button from '../../components/Button';
import { Text, View } from '../../components/Themed';
import {
  isOnboardingFinishedAtom,
  loginKakaoAtom,
  loginAppleAtom,
  loginGoogleAtom,
  userDataAtom,
} from '../../stores/auth/atoms';
import useColorScheme from '../../hooks/useColorScheme';

WebBrowser.maybeCompleteAuthSession();

interface Props extends ViewProps {};
const LoginScreen: React.FC<Props> = (props) => {
  const [isDone, setIsDone] = React.useState(false);
  const colorScheme = useColorScheme();
  const [isOnboardingFinished, setIsOnboardingFinished ] = useAtom(isOnboardingFinishedAtom);
  const pathname = usePathname();
  const loginKakao = useSetAtom(loginKakaoAtom);
  const loginApple = useSetAtom(loginAppleAtom);
  const loginGoogle = useSetAtom(loginGoogleAtom);
  const [loginGoogleReady, loginGoogleResult, loginGoogleBase] = Google.useAuthRequest({
    expoClientId: '618404683764-44mvv1k1mpsin7s7uiqmcn3h1n7sravc.apps.googleusercontent.com',
    webClientId: '618404683764-44mvv1k1mpsin7s7uiqmcn3h1n7sravc.apps.googleusercontent.com',
    androidClientId: '618404683764-vc6iaucqdo8me4am0t9062d01800q0cr.apps.googleusercontent.com',
    iosClientId: '618404683764-e4rl4qllc10k93lgs2bv7vbv9j1lruu7.apps.googleusercontent.com',
    redirectUri: 'com.sigonggan.pickforme:/(auths)/login',
  });
  const userData = useAtomValue(userDataAtom);
  const router = useRouter();
  React.useEffect(() => {
    if (userData && !isDone) {
      setIsDone(true);
      if (isOnboardingFinished !== 'true') {
        setIsOnboardingFinished('true');
      }
      if (pathname === '/login') {
        router.replace('/(tabs)');
      }
    }
  }, [userData, isOnboardingFinished, setIsOnboardingFinished, isDone]);

  React.useEffect(() => {
    if (loginGoogleResult?.type === 'success' && loginGoogleResult.authentication) {
      const { authentication: { accessToken } } = loginGoogleResult;
      loginGoogle({ accessToken });
    }
  }, [loginGoogleResult, loginGoogle]);

  if (userData) {
    return null;
  }
  const loginWithKakao = async () => {
    try {
      const token = await KakaoLogins.login();  
      loginKakao({ accessToken: token.accessToken });
    } catch (e) {
      console.log(e);
    }
  }

  const loginWithGoogle = () => {
    loginGoogleBase();
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
    <View style={[styles.container, props.style]}>
      <View style={styles.titleWrap} accessible={true}>
        <Text style={styles.title}>로그인하면 픽포미의 모든</Text>
        <Text style={styles.title}>서비스를 이용할 수 있어요!</Text>
      </View>
      <View style={styles.buttonWrap}>
        <Button
          title='카카오로 로그인'
          onPress={loginWithKakao}
          style={[styles.button, styles.kakaoButton]}
          textStyle={[styles.buttonText, styles.kakaoButtonText]}
        >
          <Image style={styles.icon} source={require('../../assets/images/auth/kakao.png')} />
        </Button>
        <View style={styles.button}>
        {Platform.OS === 'ios' && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={colorScheme === 'light'
              ? AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              : AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
            }
            cornerRadius={15}
            style={styles.appleButton}
            onPress={loginWithApple}
          />
        )}
        </View>
        <Button
          title='구글로 로그인'
          onPress={loginWithGoogle}
          style={[styles.button, styles.googleButton]}
          textStyle={[styles.buttonText, styles.googleButtonText]}
        >
          <Image style={styles.icon} source={require('../../assets/images/auth/google.png')} />
        </Button>
      </View>
      <View style={styles.descWrap} accessible={true}>
        <Text style={styles.desc}>픽포미에 첫 회원가입하고</Text>
        <Text style={styles.desc}>무료 1픽을 획득하세요!</Text>
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
    fontSize: 20,
    lineHeight: 24,
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
    width: 18,
    height: 18,
    marginRight: 8,
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

export default LoginScreen;
