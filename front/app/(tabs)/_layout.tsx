import { Tabs } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAtom } from 'jotai';

import { HomeIcon, WishListIcon, MyIcon } from '@assets';
import useColorScheme from '../../hooks/useColorScheme';
import { Colors } from '@constants';
import { How } from '@components';
import { isShowOnboardingModalAtom } from '@stores';

import Modal from 'react-native-modal';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [isModalVisible, setModalVisible] = useAtom(isShowOnboardingModalAtom);
    useEffect(() => {
        setModalVisible(true);
    }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
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
                            shadowOpacity: 0
                        },
                        default: {
                            height: 100,
                            backgroundColor: Colors?.[colorScheme]?.button.primary.background,
                            borderTopWidth: 0,
                            elevation: 0,
                            shadowOpacity: 0
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
