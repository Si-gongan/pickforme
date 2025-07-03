import { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';

import { LoginForm, BackHeader } from '@components';
import { userAtom } from '@stores';
import BackIcon from '@/assets/icons/BackIcon';

export default function LoginScreen() {
    const colorScheme = useColorScheme();
    const style = useStyle(colorScheme);
    const router = useRouter();

    const user = useAtomValue(userAtom);

    useEffect(
        function () {
            if (user?._id && router.canGoBack()) {
                router.back();
            }
        },
        [user?._id, router]
    );

    return (
        <View style={style.LoginScreenContainer} onAccessibilityEscape={() => router.back()}>
            <Pressable
                onPress={() => router.push('/(tabs)')}
                accessible
                accessibilityRole="button"
                accessibilityLabel="뒤로가기"
                style={{ marginTop: 100, marginLeft: 20 }}
                onAccessibilityEscape={() => router.push('/(tabs)')}
            >
                <BackIcon size={48} color={Colors[colorScheme].text.primary} />
            </Pressable>
            <View style={style.LoginScreenContent}>
                <LoginForm />
            </View>
        </View>
    );
}

function useStyle(colorScheme: ReturnType<typeof useColorScheme>) {
    const theme = Colors[colorScheme];
    return StyleSheet.create({
        LoginScreenContainer: {
            flex: 1,
            backgroundColor: theme.background.primary
        },
        LoginScreenContent: {
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 80,
            backgroundColor: theme.background.primary
        }
    });
}
