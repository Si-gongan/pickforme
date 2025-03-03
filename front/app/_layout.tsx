import { useEffect, Suspense, Fragment } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider, useAtomValue, useAtom } from "jotai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { settingAtom, isLoadedAtom, userAtom } from "@stores";
import { changeToken } from "@services";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const setting = useAtomValue(settingAtom);
  const user = useAtomValue(userAtom);
  const [isLoaded, onLoaded] = useAtom(isLoadedAtom);

  useEffect(function () {
    (async function () {
      const storage = await AsyncStorage.getItem("isLoaded");
      if (!storage) {
        onLoaded("true");
      }
    })();
  }, []);

  useEffect(
    function () {
      if (isLoaded && user?.token) {
        changeToken();
      }
    },
    [isLoaded, user?.token]
  );

  useEffect(
    function () {
      if (loaded && isLoaded) {
        SplashScreen.hideAsync();
      }
    },
    [loaded, isLoaded]
  );

  if (!loaded || !loaded) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <QueryClientProvider client={queryClient}>
        <JotaiProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack
              initialRouteName={setting.isReady ? "(tabs)" : "(onboarding)"}
            >
              {!setting.isReady ? (
                <Stack.Screen
                  name="(onboarding)"
                  options={{ headerShown: false }}
                />
              ) : (
                <Fragment>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="product-detail"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="info" options={{ headerShown: false }} />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="push" options={{ headerShown: false }} />
                  <Stack.Screen name="mode" options={{ headerShown: false }} />
                  <Stack.Screen name="faq" options={{ headerShown: false }} />
                  <Stack.Screen name="how" options={{ headerShown: false }} />
                </Fragment>
              )}
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </JotaiProvider>
      </QueryClientProvider>
    </Suspense>
  );
}
