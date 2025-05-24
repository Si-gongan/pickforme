import { useEffect, Suspense } from 'react';
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useColorScheme from '../hooks/useColorScheme';
import { useInitializationAndRouting } from '../hooks/useInitializationAndRouting';
import { changeToken, setClientToken, attempt } from '../utils/axios';
import { GetPopupAPI } from '../stores/auth';
import NonSubscriberManagerBottomSheet from '../components/BottomSheet/Membership/NonSubscriberManager';
import LoginBottomSheet from '../components/BottomSheet/Login';
import { useScreenTracking } from '@/hooks/useScreenTracking';
import SubscriptionBottomSheet from '@/components/BottomSheet/Membership/Subscription';
import UnsubscribeBottomSheet from '@/components/BottomSheet/Membership/Unsubscribe';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    const [fontLoaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
    });

    const { isTotalLoading } = useInitializationAndRouting(fontLoaded);

    useScreenTracking();

    // 로딩 중이면 아무것도 렌더링 하지 않음
    if (isTotalLoading) {
        return null;
    }

    return (
        <Suspense fallback={null}>
            <QueryClientProvider client={queryClient}>
                <JotaiProvider>
                    <Stack
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
                    <LoginBottomSheet />
                    <SubscriptionBottomSheet />
                    <UnsubscribeBottomSheet />
                </JotaiProvider>
            </QueryClientProvider>
        </Suspense>
    );
}
