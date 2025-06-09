import { Tabs } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import { useAtom } from 'jotai';

import { HomeIcon, WishListIcon, MyIcon } from '@assets';
import useColorScheme from '../../hooks/useColorScheme';
import { Colors } from '@constants';
import { How, Survey } from '@components';
import { isShowOnboardingModalAtom } from '@stores';
import { PopupService } from '@/services/popup';

import Modal from 'react-native-modal';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [isModalVisible, setModalVisible] = useAtom(isShowOnboardingModalAtom);
    const [isSurveyVisible, setSurveyVisible] = React.useState(false);

    useEffect(() => {
        const checkSurveyPopup = async () => {
            try {
                const hasSurvey = await PopupService.checkSurveyPopup();

                if (hasSurvey) {
                    setSurveyVisible(true);
                }
            } catch (error) {
                console.error('설문조사 팝업 체크 에러:', error);
            }
        };

        checkSurveyPopup();
    }, []);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleSurveyClick = () => {
        Linking.openURL('https://forms.gle/mpVjgn7bCZ4iMvJD9');
        setSurveyVisible(false);
    };

    const handleHelpClick = () => {
        Linking.openURL('https://pf.kakao.com/_csbDxj');
        setSurveyVisible(false);
    };

    const handleDontShowToday = async () => {
        try {
            await PopupService.setDontShowSurvey();
            setSurveyVisible(false);
        } catch (error) {
            console.error('설문조사 팝업 설정 실패:', error);
        } finally {
            setSurveyVisible(false);
        }
    };

    return (
        <>
            <Modal
                isVisible={isModalVisible}
                onBackButtonPress={toggleModal}
                onBackdropPress={toggleModal}
                animationIn="slideInUp"
                animationInTiming={300}
                style={{
                    justifyContent: 'flex-end',
                    margin: 0
                }}
            >
                <How />
            </Modal>

            <Survey
                visible={isSurveyVisible}
                onClose={() => setSurveyVisible(false)}
                onDontShowToday={handleDontShowToday}
                onSurveyClick={handleSurveyClick}
                onHelpClick={handleHelpClick}
            />

            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Colors?.[colorScheme]?.button.primary.text,
                    headerShown: false,
                    tabBarStyle: Platform.select({
                        ios: {
                            position: 'absolute',
                            backgroundColor: Colors?.[colorScheme]?.button.primary.background
                        },
                        default: {
                            height: 100,
                            backgroundColor: Colors?.[colorScheme]?.button.primary.background
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
                            return <HomeIcon size={28} color={color} opacity={focused ? 1 : 0.5} />;
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
                            return <WishListIcon size={28} color={color} opacity={focused ? 1 : 0.5} />;
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
                            return <MyIcon size={28} color={color} opacity={focused ? 1 : 0.5} />;
                        }
                    }}
                />
            </Tabs>
        </>
    );
}
