import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, SplashScreen, Stack } from 'expo-router';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Suspense, useEffect } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import { Provider as JotaiProvider } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useInterceptor from '../hooks/useInterceptor';
import useSocket from '../hooks/useSocket';

import Colors from '../constants/Colors';

import { userDataAtom, settingAtom, isLoadedAtom, setClientTokenAtom } from '../stores/auth/atoms';
import HeaderLeft from '../components/HeaderLeft';
import LoginBottomSheet from '../components/BottomSheet/Login';
import LackBottomSheet from '../components/BottomSheet/Lack';
import GreetingBottomSheet from '../components/BottomSheet/Greeting';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';


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
  headerTitle: '',
  headerLeft: HeaderLeft,
}
function RootLayoutNav() {
  const setClientToken = useSetAtom(setClientTokenAtom);
  const colorScheme = useColorScheme();
  const setting = useAtomValue(settingAtom);
  const userData = useAtomValue(userDataAtom);
  const [isLoaded, setIsLoaded] = useAtom(isLoadedAtom);
  useSocket();
  useInterceptor();
  useEffect(() => {
    (async () => {
      const storageIsLoaded = await AsyncStorage.getItem('isLoaded');
      if (!storageIsLoaded) {
        setIsLoaded('true');
        // await AsyncStorage.setItem('isLoaded', 'true');
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
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            initialRouteName={setting.isReady ? '(tabs)' : '(onboarding)'}
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors[colorScheme ?? 'light'].background.primary,
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auths)" options={hideHeaderOption} />
            <Stack.Screen name="(settings)" options={hideHeaderOption} />
            <Stack.Screen name="buy" options={hideHeaderOption} />
            <Stack.Screen name="point" options={hideHeaderOption} />
            <Stack.Screen name="recommend" options={hideHeaderOption} />
            <Stack.Screen name="research" options={hideHeaderOption} />
            <Stack.Screen name="chat" options={hideHeaderOption} />
            <Stack.Screen name="request" options={hideHeaderOption} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false, presentation: 'modal' }} />
          </Stack>
          <LoginBottomSheet />
          <LackBottomSheet />
          <GreetingBottomSheet />
        </ThemeProvider>
      </Suspense>
  );
}
const styles = StyleSheet.create({
});
