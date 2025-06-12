import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Linking } from 'react-native';

import { useCheckIsFirstLogin } from '@/hooks/useCheckIsFirstLogin';
import { usePopupSystem } from '@/hooks/usePopupSystem';
import { HomeIcon, MyIcon, WishListIcon } from '@assets';
import { How, Survey } from '@components';
import { Colors } from '@constants';
import useColorScheme from '../../hooks/useColorScheme';
import { PopupService } from '@/services/popup';

import Modal from 'react-native-modal';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [isHowModalVisible, setIsHowModalVisible] = React.useState(false);
    const [isSurveyVisible, setIsSurveyVisible] = React.useState(false);
    const { isFirstLogin } = useCheckIsFirstLogin();
    const { registerPopup, showNextPopup, handlePopupClose, isRegistered } = usePopupSystem();

    // 팝업 등록
    useEffect(() => {
        registerPopup({
            id: 'how',
            shouldShow: async () => {
                // return true;
                return isFirstLogin;
            },
            onShow: () => {
                setTimeout(() => {
                    setIsHowModalVisible(true);
                }, 300);
            },
            onClose: () => {
                setIsHowModalVisible(false);
            },
            priority: 2
        });

        registerPopup({
            id: 'survey',
            shouldShow: async () => {
                try {
                    const result = await PopupService.checkSurveyPopup();
                    return result;
                } catch (error) {
                    console.error('설문조사 팝업 체크 에러:', error);
                    return false;
                }
            },
            onShow: () => {
                setTimeout(() => {
                    setIsSurveyVisible(true);
                }, 300);
            },
            onClose: () => {
                setIsSurveyVisible(false);
            },
            priority: 1
        });
    }, [isFirstLogin, registerPopup]);

    // 팝업 등록이 완료되면 showNextPopup 호출
    useEffect(() => {
        if (isRegistered) {
            showNextPopup();
        }
    }, [isRegistered]);

    return (
        <>
            <Survey
                visible={isSurveyVisible}
                onClose={handlePopupClose}
                onDontShowToday={async () => {
                    try {
                        await PopupService.setDontShowSurvey();
                        handlePopupClose();
                    } catch (error) {
                        console.error('설문조사 팝업 설정 실패:', error);
                    }
                }}
                onSurveyClick={() => {
                    Linking.openURL('https://forms.gle/mpVjgn7bCZ4iMvJD9');
                }}
                onHelpClick={() => {
                    Linking.openURL('https://pf.kakao.com/_csbDxj');
                }}
            />

            <Modal
                isVisible={isHowModalVisible}
                onBackButtonPress={handlePopupClose}
                onBackdropPress={handlePopupClose}
                animationIn="slideInUp"
                animationInTiming={300}
                style={{
                    justifyContent: 'flex-end',
                    margin: 0
                }}
                onAccessibilityEscape={handlePopupClose}
            >
                <How visible={isHowModalVisible} onClose={handlePopupClose} />
            </Modal>

            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Colors?.[colorScheme]?.button.primary.text,
                    headerShown: false,
                    tabBarItemStyle: {
                        paddingTop: 12
                    },
                    tabBarStyle: Platform.select({
                        ios: {
                            position: 'absolute',
                            backgroundColor: Colors?.[colorScheme]?.button.primary.background,
                            borderTopWidth: 0,
                            elevation: 0,
                            shadowOpacity: 0,
                            height: 90,
                            paddingBottom: 20
                        },
                        default: {
                            height: 100,
                            backgroundColor: Colors?.[colorScheme]?.button.primary.background,
                            borderTopWidth: 0,
                            elevation: 0
                        }
                    })
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarLabel: '홈',
                        tabBarAccessibilityLabel: '홈 탭',
                        tabBarIcon: function ({ color, focused }) {
                            return <HomeIcon size={28} color={'white'} opacity={focused ? 1 : 0.5} />;
                        }
                    }}
                />

                <Tabs.Screen
                    name="wishlist"
                    options={{
                        title: 'WishList',
                        tabBarLabel: '위시리스트',
                        tabBarAccessibilityLabel: '위시리스트 탭',
                        tabBarIcon: function ({ color, focused }) {
                            return <WishListIcon size={28} color={'white'} opacity={focused ? 1 : 0.5} />;
                        }
                    }}
                />

                <Tabs.Screen
                    name="mypage"
                    options={{
                        title: 'My',
                        tabBarLabel: '마이페이지',
                        tabBarAccessibilityLabel: '마이페이지 탭',
                        tabBarIcon: function ({ color, focused }) {
                            return <MyIcon size={28} color={'white'} opacity={focused ? 1 : 0.5} />;
                        }
                    }}
                />
            </Tabs>
        </>
    );
}
