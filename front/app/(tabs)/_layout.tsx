import { Tabs } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import { useAtom } from 'jotai';

import { HomeIcon, WishListIcon, MyIcon } from '@assets';
import useColorScheme from '../../hooks/useColorScheme';
import { Colors } from '@constants';
import { How, Survey } from '@components';
import { isShowOnboardingModalAtom } from '@stores';

import Modal from 'react-native-modal';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [isModalVisible, setModalVisible] = useAtom(isShowOnboardingModalAtom);
    const [isSurveyVisible, setSurveyVisible] = React.useState(true);

    useEffect(() => {
        setModalVisible(true);
    }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleSurveyClick = () => {
        Linking.openURL('YOUR_SURVEY_URL_HERE');
        setSurveyVisible(false);
    };

    const handleHelpClick = () => {
        Linking.openURL('YOUR_HELP_URL_HERE');
        setSurveyVisible(false);
    };

    const handleDontShowToday = () => {
        // TODO: AsyncStorage에 오늘 날짜 저장
        setSurveyVisible(false);
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
