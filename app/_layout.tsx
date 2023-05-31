import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, SplashScreen, Stack } from 'expo-router';
import { useAtomValue } from 'jotai';
import { Suspense, useEffect } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import { Provider as JotaiProvider } from 'jotai';

import { settingAtom } from '../stores/auth/atoms';
import HeaderLeft from '../components/HeaderLeft';

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
  return <RootLayoutNav />
}

const hideHeaderOption = {
  headerShrdowVisible: false, // applied here
  headerTitle: '',
  headerLeft: HeaderLeft,
}
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const setting = useAtomValue(settingAtom);
  return (
    <JotaiProvider>
    <Suspense>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName={setting.isReady ? '(tabs)' : '(onboarding)'}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auths)" options={hideHeaderOption} />
          <Stack.Screen name="(settings)"
            options={hideHeaderOption}
          />
          <Stack.Screen name="buy"
            options={hideHeaderOption}
          />
          <Stack.Screen name="point"
            options={hideHeaderOption}
          />
          <Stack.Screen name="recommend"
            options={hideHeaderOption}
          />
          <Stack.Screen name="research"
            options={hideHeaderOption}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
    </ThemeProvider>
    </Suspense>
    </JotaiProvider>
  );
}
const styles = StyleSheet.create({
  logoWrap: {
    flexDirection: 'row',
    marginLeft: 27,
  },
  logoImage: {
    width: 29.32,
    height: 28,
  },
  logoText: {
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 29,
  },
});
