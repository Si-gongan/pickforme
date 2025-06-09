import { Tabs } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import { useAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HomeIcon, WishListIcon, MyIcon } from '@assets';
import useColorScheme from '../../hooks/useColorScheme';
import { Colors } from '@constants';
import { How, Survey } from '@components';
import { useSurveyPopup } from '@/hooks/useSurveyPopup';

import Modal from 'react-native-modal';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [isFirstLogin, setIsFirstLogin] = React.useState(false);

    const { isSurveyVisible, handleSurveyClose, handleDontShowToday, handleSurveyClick, handleHelpClick } =
        useSurveyPopup({
            onSurveyClose: () => {
                if (isFirstLogin) {
                    setTimeout(() => {
                        setModalVisible(true);
                    }, 300);
                }
            }
        });

    useEffect(() => {
        const checkFirstLogin = async () => {
            try {
                const hasLoggedIn = await AsyncStorage.getItem('hasLoggedIn');
                if (!hasLoggedIn) {
                    setIsFirstLogin(true);
                    await AsyncStorage.setItem('hasLoggedIn', 'true');
                } else {
                    setIsFirstLogin(false);
                }
            } catch (error) {
                console.error('최초 로그인 체크 에러:', error);
            }
        };

        checkFirstLogin();
    }, []);

    return (
        <>
            <Survey
                visible={isSurveyVisible}
                onClose={handleSurveyClose}
                onDontShowToday={handleDontShowToday}
                onSurveyClick={handleSurveyClick}
                onHelpClick={handleHelpClick}
            />

            <Modal
                isVisible={isModalVisible}
                onBackButtonPress={() => setModalVisible(false)}
                onBackdropPress={() => setModalVisible(false)}
                animationIn="slideInUp"
                animationInTiming={300}
                style={{
                    justifyContent: 'flex-end',
                    margin: 0
                }}
            >
                <How />
            </Modal>

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
