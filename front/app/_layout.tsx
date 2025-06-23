import { Suspense, useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { useInitializationAndRouting } from '../hooks/useInitializationAndRouting';
import NonSubscriberManagerBottomSheet from '../components/BottomSheet/Membership/NonSubscriberManager';
import LoginBottomSheet from '../components/BottomSheet/Login';
import { useScreenTracking } from '@/hooks/useScreenTracking';
import SubscriptionBottomSheet from '@/components/BottomSheet/Membership/Subscription';
import UnsubscribeBottomSheet from '@/components/BottomSheet/Membership/Unsubscribe';
import { checkAndFetchUpdates } from '@/utils/updates';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    const [fontLoaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
    });

    const { isTotalLoading } = useInitializationAndRouting(fontLoaded);

    useScreenTracking();

    // 앱 시작 시 자동으로 업데이트 확인
    useEffect(() => {
        async function finalizeLoad() {
            if (!isTotalLoading && fontLoaded) {
                await checkAndFetchUpdates();
                await SplashScreen.hideAsync();
            }
        }
        finalizeLoad();
    }, [isTotalLoading, fontLoaded]);

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
