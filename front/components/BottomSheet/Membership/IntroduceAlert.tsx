import { Props, styles } from '../Base';
import BottomSheet from 'react-native-modal';
import { isShowIntroduceAlertAtom } from '../../../stores/auth/atoms';
import { useAtom } from 'jotai';
import Colors from '../../../constants/Colors';
import { View, Text } from '../../Themed';
import useColorScheme, { ColorScheme } from '../../../hooks/useColorScheme';
import Button from '../../Button';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { settingAtom } from '../../../stores/auth/atoms';
import React from "react";

//Membership
const IntroduceAlertBottomSheet: React.FC<Props> = () => {
    const [visible, setVisible] = useAtom(isShowIntroduceAlertAtom);
    const onClose = () => setVisible(false);
    const colorScheme = useColorScheme();
    const router = useRouter();
    const [setting,] = useAtom(settingAtom);

    const localStyles = useLocalStyles(colorScheme);

    const handleClickYes = () => {
        router.push('/faq');
        onClose();
    }
    const handleClickNo = () => {
        onClose();
    }

    return (
        <BottomSheet
            style={styles.base}
            isVisible={visible}
            onBackButtonPress={onClose}
            onBackdropPress={onClose}
        >
            <View style={[styles.bottomSheet, localStyles.root]}>
                <Text style={[styles.title, localStyles.title]} >
                    {setting.name}님! 중요한 소식이 있어요.
                </Text>
                <Text style={[styles.desc, localStyles.desc]}>
                    {'9월 3일부터 픽포미 한 달 무제한 질문권이 도입되어요.\n3일 전에 결제한 픽은 단일 질문권으로 사용가능해요.\n자세한 내용은 ‘자주 받는 질문’ 페이지를 참고해 주세요.'}
                </Text>
                <View style={[styles.buttonRow, localStyles.buttonWrap]}>
                    <View style={[styles.buttonWrap, localStyles.buttonOuter]}>
                        <Button
                            title='자세히 보러 가기' onPress={handleClickYes} style={[localStyles.button1]} size="small" />
                    </View>
                    <View style={[styles.buttonWrap, localStyles.buttonOuter]}>
                        <Button
                            color='tertiary'
                            title='나중에 확인하기' onPress={handleClickNo} style={[localStyles.button2]} size="small" />
                    </View>
                </View>
            </View>

        </BottomSheet>
    );
}

const useLocalStyles = (colorScheme: ColorScheme) => StyleSheet.create({
    root: {
        paddingBottom: 22,
    },
    title: {
        fontSize: 18,
        lineHeight: 20,
        fontWeight: '600',
        marginBottom: 20,
        color: '#1e1e1e',
    },
    desc: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 39,
    },
    buttonWrap: {

    },
    buttonOuter: {
        flex: 1,
    },
    button1: {
        minHeight: 50,
    },
    button2: {
        minHeight: 50,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: Colors[colorScheme].buttonBackground.primary,
    }
});

export default IntroduceAlertBottomSheet;