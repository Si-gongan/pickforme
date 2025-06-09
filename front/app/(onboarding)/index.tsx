import { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import useColorScheme from '../../hooks/useColorScheme';
import type { ColorScheme } from '../../hooks/useColorScheme';
import { Colors } from '@constants';
import { userAtom } from '@stores';
import { useAtomValue } from 'jotai';

import { InfoForm, Footer, Button } from '@components';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function OnBoardingInfoScreen() {
    const colorScheme = useColorScheme();
    const style = useStyle(colorScheme);
    const router = useRouter();
    const user = useAtomValue(userAtom);

    useAuthRedirect(false);

    const handleStart = () => {
        // 사용자가 로그인되어 있으면 탭 화면으로 이동, 아니면 로그인 화면으로 이동
        if (user?._id) {
            router.push('/(tabs)');
        } else {
            router.push('/login');
        }
    };

    return (
        <View style={style.OnBoardingInfoContainer}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

            <View
                style={[styles.content, { backgroundColor: Colors[colorScheme].background.primary, marginBottom: 20 }]}
            >
                <Text style={[styles.welcomeText, { color: Colors[colorScheme].text.primary, marginBottom: 20 }]}>
                    안녕하세요.
                </Text>
                <Text style={[styles.welcomeText, { color: Colors[colorScheme].text.primary, marginBottom: 20 }]}>
                    시각장애인을 위한
                </Text>
                <Text style={[styles.welcomeText, { color: Colors[colorScheme].text.primary, marginBottom: 28 }]}>
                    쇼핑 서비스
                </Text>
                <Text style={[styles.welcomeSubText, { color: Colors[colorScheme].text.primary }]}>
                    <Text style={[styles.boldSystemText, { color: Colors[colorScheme].text.primary }]}>픽포미</Text>에
                    오신것을 환영합니다!
                </Text>
            </View>

            <View style={styles.footer}>
                <Button title="시작하기" onPress={handleStart} />
            </View>
        </View>
    );
}

function useStyle(colorScheme: ColorScheme) {
    return StyleSheet.create({
        OnBoardingInfoContainer: {
            flex: 1,
            backgroundColor: Colors[colorScheme].background.primary
        },
        OnBoardingInfoContent: {
            flex: 1
        }
    });
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between'
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: '4%'
    },
    logo: {
        width: 200,
        height: 200
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text.primary,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
        fontFamily: 'Noto sans'
    },
    welcomeText: {
        fontSize: 22,
        width: '80%',
        fontWeight: '600',
        color: Colors.light.text.primary,
        textAlign: 'left',
        lineHeight: 26,
        fontFamily: 'Noto sans'
    },
    welcomeSubText: {
        fontSize: 18,
        width: '80%',
        fontWeight: '400',
        color: Colors.light.text.primary,
        textAlign: 'left',
        fontFamily: 'Noto sans'
    },
    boldSystemText: {
        fontWeight: 'bold'
    },
    footer: {
        flex: 0.1,
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignItems: 'center'
    }
});
