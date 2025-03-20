import { Tabs } from "expo-router";
import React, { useRef, useEffect } from "react";
import { Platform } from "react-native";
import { useAtom } from "jotai";

import { HomeIcon, WishListIcon, MyIcon } from "@assets";
import { useColorScheme } from "@hooks";
import { Colors } from "@constants";
import { How } from "@components";
import { isShowOnboardingModalAtom } from "@stores";

import Modal from "react-native-modal";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const [isModalVisible, setModalVisible] = useAtom(
        isShowOnboardingModalAtom
    );
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
                animationIn="slideInUp" // 기본값, 아래에서 위로 올라옴
                animationInTiming={300} // 애니메이션 속도(ms)
                style={{
                    justifyContent: "flex-end", // 화면 하단에 모달 위치
                    margin: 0, // 마진 제거
                }}
            >
                <How />
            </Modal>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor:
                        Colors?.[colorScheme ?? "light"]?.tint?.primary ||
                        "#기본색상",
                    headerShown: false,
                    tabBarStyle: Platform.select({
                        ios: {
                            position: "absolute",
                        },
                        default: {
                            height: 100,
                        },
                    }),
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarLabel: "홈",
                        tabBarAccessibilityLabel: "홈 탭",
                        tabBarIcon: function ({ color }) {
                            return <HomeIcon size={28} color={color} />;
                        },
                    }}
                />

                <Tabs.Screen
                    name="wishlist"
                    options={{
                        title: "WishList",
                        tabBarLabel: "위시리스트",
                        tabBarAccessibilityLabel: "위시리스트 탭",
                        tabBarIcon: function ({ color }) {
                            return <WishListIcon size={28} color={color} />;
                        },
                    }}
                />

                <Tabs.Screen
                    name="mypage"
                    options={{
                        title: "My",
                        tabBarLabel: "마이페이지",
                        tabBarAccessibilityLabel: "마이페이지 탭",
                        tabBarIcon: function ({ color }) {
                            return <MyIcon size={28} color={color} />;
                        },
                    }}
                />
            </Tabs>
        </>
    );
}
