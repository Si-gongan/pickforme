/**
 * 멤버십 결제 해지 모달 컴포넌트
 */
import React from "react";
import { useRef, useEffect } from "react";
import { findNodeHandle, AccessibilityInfo, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import BottomSheet from "react-native-modal";
import { useAtom } from "jotai";
import { deepLinkToSubscriptions } from "react-native-iap";

import { isShowUnsubscribeModalAtom, settingAtom } from "@stores";
import { View, Text, Button } from "@components";
import { useColorScheme } from "@hooks";
import { Colors } from "@constants";
import { Props, styles } from "../Base";

import type { ColorScheme } from "@hooks";

// Membership
const UnsubscribeBottomSheet: React.FC<Props> = () => {
    const router = useRouter();
    const headerTitleRef = useRef(null);

    const [visible, setVisible] = useAtom(isShowUnsubscribeModalAtom);
    const [setting] = useAtom(settingAtom);

    const colorScheme = useColorScheme();
    const localStyles = useLocalStyles(colorScheme);

    const onClose = () => setVisible(false);

    const handleClickYes = () => {
        onClose();
    };
    const handleClickNo = () => {
        onClose();
        try {
            // SKU 값과 필요한 옵션을 추가
            deepLinkToSubscriptions({
                sku: "pickforme_basic", // 실제 구독 상품 SKU
                isAmazonDevice: false, // Amazon 장치가 아닌 경우 false로 설정
            });
        } catch (err) {
            console.error("구독 관리 페이지로 이동하는 중 오류 발생:", err);
        }
    };

    useEffect(() => {
        const focusOnHeader = () => {
            const node = findNodeHandle(headerTitleRef.current);
            if (visible && node) {
                AccessibilityInfo.setAccessibilityFocus(node);
            }
        };
        setTimeout(focusOnHeader, 500);
    }, [visible]);

    return (
        <BottomSheet
            style={styles.base}
            isVisible={visible}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
        >
            <View style={[styles.bottomSheet, localStyles.root]}>
                <Text
                    style={[styles.title, localStyles.title]}
                    ref={headerTitleRef}
                >
                    {setting.name}님 잠시만요!
                </Text>
                <Text style={[styles.desc, localStyles.desc]}>
                    {
                        "픽포미 멤버십을 해지하면,\n앞으로 AI 질문과 매니저에게 질문하기 기능이 제한됩니다.\n그래도 멤버십을 해지하시겠어요?"
                    }
                </Text>
                <View style={[styles.buttonRow, localStyles.buttonWrap]}>
                    <View style={[styles.buttonWrap, localStyles.buttonOuter]}>
                        <Button
                            title="멤버십 유지하기"
                            onPress={handleClickYes}
                            style={[localStyles.button1]}
                            size="small"
                        />
                    </View>
                    <View style={[styles.buttonWrap, localStyles.buttonOuter]}>
                        <Button
                            color="tertiary"
                            title="해지하기"
                            onPress={handleClickNo}
                            style={[localStyles.button2]}
                            size="small"
                        />
                    </View>
                </View>
            </View>
        </BottomSheet>
    );
};

const useLocalStyles = (colorScheme: ColorScheme) =>
    StyleSheet.create({
        root: {
            paddingBottom: 22,
        },
        title: {
            fontSize: 18,
            lineHeight: 20,
            fontWeight: "600",
            marginBottom: 20,
            color: "#1e1e1e",
        },
        desc: {
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 39,
        },
        buttonWrap: {},
        buttonOuter: {
            flex: 1,
        },
        button1: {
            minHeight: 50,
        },
        button2: {
            minHeight: 50,
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: Colors[colorScheme].buttonBackground.primary,
        },
    });

export default UnsubscribeBottomSheet;
