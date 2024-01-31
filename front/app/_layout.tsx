import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, SplashScreen, Stack, ErrorBoundary } from 'expo-router';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Suspense, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Provider as JotaiProvider } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useInterceptor from '../hooks/useInterceptor';
import useColorScheme from '../hooks/useColorScheme';
import useSocket from '../hooks/useSocket';
import usePushToken from '../hooks/usePushToken';
import useRouterNotification from '../hooks/useRouterNotification';

import { Text } from '../components/Themed';
import Colors from '../constants/Colors';

import { bottomSheetsAtom } from '../stores/layout/atoms';
import { userDataAtom, settingAtom, isLoadedAtom, setClientTokenAtom } from '../stores/auth/atoms';
import HeaderLeft from '../components/HeaderLeft';
import LoginBottomSheet from '../components/BottomSheet/Login';
import LackBottomSheet from '../components/BottomSheet/Lack';
import GreetingBottomSheet from '../components/BottomSheet/Greeting';
import CommonBottomSheet from '../components/BottomSheet/Common';
import ReviewBottomSheet from '../components/BottomSheet/Review';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return <SplashScreen />;
  }
  return (
        <Suspense fallback={null}>
    <JotaiProvider>
      <RootLayoutNav />
    </JotaiProvider>
    </Suspense>
  );
}

const hideHeaderOption = {
  headerShadowVisible: false, // applied here
  headerTitle: () => <Text accessible={false} />,
  headerBackVisible: false,
  headerLeft: HeaderLeft,
}
function RootLayoutNav() {
  const bottomSheets = useAtomValue(bottomSheetsAtom);
  const setClientToken = useSetAtom(setClientTokenAtom);
  const colorScheme = useColorScheme();
  const setting = useAtomValue(settingAtom);
  const userData = useAtomValue(userDataAtom);
  const [isLoaded, setIsLoaded] = useAtom(isLoadedAtom);
  usePushToken();
  useSocket();
  useRouterNotification
  useInterceptor();
  useEffect(() => {
    (async () => {
      const storageIsLoaded = await AsyncStorage.getItem('isLoaded');
      if (!storageIsLoaded) {
        setIsLoaded('true');
      }
    })();
  }, []);

  useEffect(() => {
    if (isLoaded && userData) {
      setClientToken();
    }
  }, [setClientToken, isLoaded, userData]);

  if (isLoaded === 'false') {
    return <SplashScreen />
  }
  return (
      <Suspense fallback={null}>
        <ThemeProvider value={DefaultTheme}>
          <Stack
            initialRouteName={setting.isReady ? '(tabs)' : '(onboarding)'}
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors[colorScheme].background.primary,
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {["discover-detail", "(auths)", "(settings)", "buy", "point", "point-history", "recommend", "research", "chat", "request", "how", "faq", "recommend-sample", "research-sample"].map((name) => (
              <Stack.Screen name={name} options={hideHeaderOption} key={`index-route-${name}`} />
            ))}
            <Stack.Screen name="notices" options={{ ...hideHeaderOption, headerTitle: undefined, title: '공지사항' }} />
            <Stack.Screen name="notice" options={{ ...hideHeaderOption, headerTitle: undefined, title: '공지사항' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false, presentation: 'modal' }} />
          </Stack>
          <LoginBottomSheet />
          <LackBottomSheet />
          <GreetingBottomSheet />
          <ReviewBottomSheet />
          {bottomSheets.map((info, i) => (
            <CommonBottomSheet info={info} index={i} />
          ))}
        </ThemeProvider>
      </Suspense>
  );
}
const styles = StyleSheet.create({
});
