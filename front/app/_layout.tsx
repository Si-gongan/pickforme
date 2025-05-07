import { useEffect, Suspense, useState } from 'react';
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider, useAtomValue, useAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useColorScheme from '../hooks/useColorScheme';
import { settingAtom, isLoadedAtom, userAtom } from '@stores';
import { changeToken, setClientToken, attempt } from '../utils/axios';
import { GetPopupAPI } from '../stores/auth';
import NonSubscriberManagerBottomSheet from '../components/BottomSheet/Membership/NonSubscriberManager';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
    });

    const setting = useAtomValue(settingAtom);
    const user = useAtomValue(userAtom);
    const [isLoaded, onLoaded] = useAtom(isLoadedAtom);
    const [isHansiryunPopup, setIsHansiryunPopup] = useState(false);

    useEffect(function () {
        (async function () {
            const storage = await AsyncStorage.getItem('isLoaded');
            if (!storage) {
                onLoaded('true');
            }
        })();
    }, []);

    useEffect(() => {
        setClientToken(user.token);

        if (user?._id) {
            attempt(() => GetPopupAPI()).then(res => {
                if (res.ok) {
                    console.log('팝업 설정:', res.value?.data);
                    const flag = res.value?.data?.find(p => p.popup_id === 'event_hansiryun');
                    if (flag) setIsHansiryunPopup(true);
                }
            });
        }
    }, [user]);

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
                    {/* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}
                    <Stack
                        initialRouteName={
                            user?.token
                                ? isHansiryunPopup
                                    ? '(hansiryun)'
                                    : '(tabs)'
                                : setting?.isReady
                                ? '(tabs)'
                                : '(onboarding)'
                        }
                        screenOptions={{
                            headerShown: false
                        }}
                    >
                        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="(hansiryun)" options={{ headerShown: false }} />
                        <Stack.Screen name="product-detail" options={{ headerShown: false }} />
                        <Stack.Screen name="info" options={{ headerShown: false }} />
                        <Stack.Screen name="login" options={{ headerShown: false }} />
                        <Stack.Screen name="push" options={{ headerShown: false }} />
                        <Stack.Screen name="mode" options={{ headerShown: false }} />
                        <Stack.Screen name="faq" options={{ headerShown: false }} />
                        <Stack.Screen name="how" options={{ headerShown: false }} />
                    </Stack>
                    <StatusBar style="auto" />
                    <NonSubscriberManagerBottomSheet />
                    {/* </ThemeProvider> */}
                </JotaiProvider>
            </QueryClientProvider>
        </Suspense>
    );
}
