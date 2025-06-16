import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAtom } from 'jotai';
import * as WebBrowser from 'expo-web-browser';
import useColorScheme from '../../hooks/useColorScheme';
import type { ColorScheme } from '../../hooks/useColorScheme';
import Colors from '../../constants/Colors';

import { IconHeader, MySection } from '@components';
import { userAtom } from '@stores';
import { changeToken } from '../../utils/axios';

export default function MyScreen() {
    const colorScheme = useColorScheme();
    const style = useStyle(colorScheme);
    const router = useRouter();

    const [user, onUser] = useAtom(userAtom);

    const goToInfo = useCallback(
        function () {
            // @ts-ignore - Expo Router 4 type issues
            router.push('/info');
        },
        [router]
    );

    const goToLogin = useCallback(
        function () {
            // @ts-ignore - Expo Router 4 type issues
            router.push('/login');
        },
        [router]
    );

    const goToPush = useCallback(
        function () {
            // @ts-ignore - Expo Router 4 type issues
            router.push('/(settings)/notification');
        },
        [router]
    );

    const goToTheme = useCallback(
        function () {
            // @ts-ignore - Expo Router 4 type issues
            router.push('/(settings)/theme');
        },
        [router]
    );

    const goToHow = useCallback(
        function () {
            // @ts-ignore - Expo Router 4 type issues
            router.push('/how');
        },
        [router]
    );

    const goToFontSize = useCallback(
        function () {
            // @ts-ignore - Expo Router 4 type issues
            router.push('/(settings)/setFontSize');
        },
        [router]
    );

    const goToFAQ = useCallback(
        function () {
            // @ts-ignore - Expo Router 4 type issues
            router.push('/faq');
        },
        [router]
    );

    const goToSubscription = useCallback(
        function () {
            // @ts-ignore - Expo Router 4 type issues
            router.push('/subscription');
        },
        [router]
    );

    const goToSubscriptionHistory = useCallback(
        function () {
            // @ts-ignore - Expo Router 4 type issues
            router.push('/subscription-history');
        },
        [router]
    );

    const onLogout = useCallback(
        function () {
            onUser({});
            changeToken(undefined);
            Alert.alert('로그아웃 되었습니다.');
        },
        [onUser]
    );

    const myInfoMenu = useMemo(
        function () {
            // const defaultMenu = [{ name: '내 정보 수정하기', onPress: goToInfo }];
            if (!user?._id) {
                return [{ name: '로그인', onPress: goToLogin }];
            }
            return [
                // ...defaultMenu,
                { name: '멤버십 이용하기', onPress: goToSubscription },
                { name: '멤버십 구매내역', onPress: goToSubscriptionHistory }
            ];
        },
        [user?._id, goToInfo, goToLogin, goToSubscription, goToSubscriptionHistory]
    );

    const appSettingMenu = useMemo(
        function () {
            const defaultMenu = [
                { name: '화면 모드 변경하기', onPress: goToTheme },
                // { name: '글자 크기 변경하기', onPress: goToFontSize },
                {
                    name: '알림 설정하기',
                    onPress: goToPush
                }
            ];
            return defaultMenu;
        },
        [user?._id, goToPush]
    );

    return (
        <View style={style.MyContainer}>
            <IconHeader title="마이페이지" />
            <View style={style.MyContent}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={style.MyScrollView}>
                    {!!user?._id && (
                        <MySection
                            title="잔여 이용권"
                            items={[
                                { name: `매니저 질문권 ${user.point ?? 0}회` },
                                { name: `AI 질문권 ${user.aiPoint ?? 0}회` }
                            ]}
                            role="header"
                        />
                    )}

                    <MySection title="내 정보" items={myInfoMenu} role="button" />

                    <MySection title="앱 설정" items={appSettingMenu} role="button" />

                    <MySection
                        title="고객 지원"
                        role="button"
                        items={[
                            {
                                name: '1:1 문의',
                                onPress: function () {
                                    WebBrowser.openBrowserAsync('http://pf.kakao.com/_csbDxj');
                                }
                            },
                            { name: '사용 설명서', onPress: goToHow },
                            { name: '자주 묻는 질문', onPress: goToFAQ },
                            {
                                name: '개인정보처리방침',
                                onPress: function () {
                                    WebBrowser.openBrowserAsync(
                                        'https://sites.google.com/view/sigongan-useterm/개인정보처리방침?authuser=0'
                                    );
                                }
                            },
                            {
                                name: '서비스 이용약관',
                                onPress: function () {
                                    WebBrowser.openBrowserAsync(
                                        'https://sites.google.com/view/sigongan-useterm/홈?authuser=0'
                                    );
                                }
                            }
                        ]}
                    />

                    {!!user?._id && (
                        <MySection
                            title="계정"
                            items={[
                                { name: '로그아웃', onPress: onLogout },
                                { name: '회원탈퇴', onPress: goToLogin }
                            ]}
                            role="button"
                        />
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

function useStyle(colorScheme: ColorScheme) {
    const theme = Colors[colorScheme];
    return StyleSheet.create({
        MyContainer: {
            flex: 1,
            backgroundColor: theme.background.primary
        },
        MyContent: {
            flex: 1,
            backgroundColor: theme.background.primary
        },
        MyScrollView: {
            paddingTop: 20,
            paddingBottom: 96,
            paddingHorizontal: 20,
            backgroundColor: theme.background.primary
        }
    });
}
