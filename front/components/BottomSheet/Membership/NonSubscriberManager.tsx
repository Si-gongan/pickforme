import React, { useRef, useEffect } from 'react';
import { findNodeHandle, AccessibilityInfo, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BottomSheet from 'react-native-modal';
import { useAtom } from 'jotai';

import { isShowNonSubscriberManagerModalAtom, settingAtom } from '@stores';
import { View, Text, Button } from '@components';
import { Props, styles } from '../Base';
import { Colors } from '@constants';
import useColorScheme from '../../../hooks/useColorScheme';

import type { ColorScheme } from '@hooks';

// Membership
const NonSubscriberManagerBottomSheet: React.FC<Props> = () => {
    const router = useRouter();
    const headerTitleRef = useRef(null);

    const [visible, setVisible] = useAtom(isShowNonSubscriberManagerModalAtom);
    const [setting] = useAtom(settingAtom);

    const colorScheme = useColorScheme();
    const localStyles = useLocalStyles(colorScheme);

    const onClose = () => setVisible(false);

    const handleClickYes = () => {
        router.push('/subscription');
        onClose();
    };
    const handleClickNo = () => {
        onClose();
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
        <BottomSheet style={styles.base} isVisible={visible} onBackButtonPress={onClose} onBackdropPress={onClose}>
            <View style={[styles.bottomSheet, localStyles.root]}>
                <Text style={[styles.title, localStyles.title]} ref={headerTitleRef}>
                    픽포미플러스 멤버십 기능이에요.
                </Text>
                <Text style={[styles.desc, localStyles.desc]}>
                    {
                        '픽포미플러스 멤버십을 구독하면,\n매니저에게 한 달 간 30회까지 질문이 가능해요.\n지금 멤버십을 시작하시겠어요?'
                    }
                </Text>
                <View style={[styles.buttonRow, localStyles.buttonWrap]}>
                    <View style={[styles.buttonWrap, localStyles.buttonOuter]}>
                        <Button
                            title="지금 시작하기"
                            onPress={handleClickYes}
                            style={[localStyles.button1]}
                            size="small"
                        />
                    </View>
                    <View style={[styles.buttonWrap, localStyles.buttonOuter]}>
                        <Button
                            color="tertiary"
                            title="나중에 할래요"
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
            paddingBottom: 22
        },
        title: {
            fontSize: 18,
            lineHeight: 20,
            fontWeight: '600',
            marginBottom: 20,
            color: '#1e1e1e'
        },
        desc: {
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 39
        },
        buttonWrap: {},
        buttonOuter: {
            flex: 1
        },
        button1: {
            minHeight: 50
        },
        button2: {
            minHeight: 50,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: Colors[colorScheme].button.primary.background
        }
    });

export default NonSubscriberManagerBottomSheet;
