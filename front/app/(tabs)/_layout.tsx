import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Linking, TouchableOpacity, View, Text } from 'react-native';

import { useCheckIsFirstLogin } from '@/hooks/useCheckIsFirstLogin';
import { usePopupSystem } from '@/hooks/usePopupSystem';
import { HomeIcon, MyIcon, WishListIcon } from '@assets';
import { How, Survey } from '@components';
import { Colors } from '@constants';
import useColorScheme from '../../hooks/useColorScheme';
import { PopupService } from '@/services/popup';
import { useAtom, useSetAtom } from 'jotai';
import Modal from 'react-native-modal';
import { searchTextAtom, searchQueryAtom, currentCategoryAtom, scrollResetTriggerAtom } from '../../stores/search';
import { getMainProductsAtom } from '../../stores/product/atoms';
import { categoryName, CATEGORIES } from '@/constants/Categories';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [isHowModalVisible, setIsHowModalVisible] = React.useState(false);
    const [isSurveyVisible, setIsSurveyVisible] = React.useState(false);
    const { isFirstLogin } = useCheckIsFirstLogin();
    const { registerPopup, showNextPopup, handlePopupClose, isRegistered } = usePopupSystem();

    const [searchText, setSearchText] = useAtom(searchTextAtom);
    const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
    const [currentCategory, setCurrentCategory] = useAtom(currentCategoryAtom);
    const [scrollResetTrigger, setScrollResetTrigger] = useAtom(scrollResetTriggerAtom);
    const getMainProducts = useSetAtom(getMainProductsAtom);

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
                        // tabBarIcon: function ({ color, focused }) {

                        //     return <HomeIcon size={28} color={'white'} opacity={focused ? 1 : 0.5} />;
                        // }
                        tabBarButton: props => {
                            const safeProps = Object.fromEntries(
                                Object.entries(props).map(([key, value]) => [key, value === null ? undefined : value])
                            );

                            const isSelected = props['aria-selected'] ?? false;

                            return (
                                <TouchableOpacity
                                    {...safeProps}
                                    onPress={e => {
                                        console.log('홈 탭 클릭!', isSelected);
                                        props.onPress?.(e);

                                        // 홈탭을 눌렀을 때 검색 정보들을 초기화
                                        if (searchText.length > 0 || searchQuery.length > 0) {
                                            setSearchText('');
                                            setSearchQuery('');
                                        } else {
                                            console.log('refresh home');
                                            const randomCategoryId =
                                                CATEGORIES[Math.floor(CATEGORIES.length * Math.random())];
                                            setCurrentCategory(
                                                categoryName[randomCategoryId as keyof typeof categoryName]
                                            );
                                            // 홈화면 데이터 새로고침
                                            getMainProducts(randomCategoryId);
                                            
                                            // 스크롤 초기화 트리거 호출
                                            setScrollResetTrigger(prev => prev + 1);
                                        }
                                    }}
                                >
                                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                        <HomeIcon
                                            size={28}
                                            color={Colors?.[colorScheme]?.button.primary.text}
                                            opacity={isSelected ? 1 : 0.5}
                                        />
                                        <Text
                                            style={{
                                                color: Colors?.[colorScheme]?.button.primary.text,
                                                fontSize: 11,
                                                opacity: isSelected ? 1 : 0.5
                                            }}
                                        >
                                            홈
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
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
