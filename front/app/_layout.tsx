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
import useGetShare from '../hooks/useGetShare';

import { Text } from '../components/Themed';
import Colors from '../constants/Colors';

import { bottomSheetsAtom } from '../stores/layout/atoms';
import { userDataAtom, settingAtom, isLoadedAtom, setClientTokenAtom } from '../stores/auth/atoms';
import HeaderLeft from '../components/HeaderLeft';
import OnboardingBottomSheet from '../components/BottomSheet/How';
import LoginBottomSheet from '../components/BottomSheet/Login';
import NoMembershipBottomSheet from '../components/BottomSheet/NoMembership';
import LackPointBottomSheet from '../components/BottomSheet/LackPoint';
import GreetingBottomSheet from '../components/BottomSheet/Greeting';
import RequestBottomSheet from '../components/BottomSheet/Request';
import CommonBottomSheet from '../components/BottomSheet/Common';

// 2024
import VersionUpdateAlarmBottomSheet from '../components/BottomSheet/VersionUpdateAlarm';
import IntroduceAlertBottomSheet from '../components/BottomSheet/Membership/IntroduceAlert';

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
  useInterceptor();
  useGetShare();
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
          {["(auths)", "(settings)", "product-detail", "purchase", "purchase-history", "faq", "how"].map((name) => (
            <Stack.Screen name={name} options={hideHeaderOption} key={`index-route-${name}`} />
          ))}
          <Stack.Screen name="(onboarding)" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
        <LoginBottomSheet />
        <GreetingBottomSheet />
        <RequestBottomSheet />
        <OnboardingBottomSheet />
        <LackPointBottomSheet />
        <NoMembershipBottomSheet />

        {/* 2024 */}
        <VersionUpdateAlarmBottomSheet />
        <IntroduceAlertBottomSheet />

        {bottomSheets.map((info, i) => (
          <CommonBottomSheet info={info} index={i} />
        ))}
      </ThemeProvider>
    </Suspense>
  );
}
const styles = StyleSheet.create({
});
