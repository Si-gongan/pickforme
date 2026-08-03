import { useRef, useState } from 'react';
import {
    AccessibilityInfo,
    Linking,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text as RNText,
    TouchableOpacity,
    View as RNView
} from 'react-native';
import Text from './Text';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { focusOnRef } from '@/utils/accessibility';

/**
 * 픽포미 4.0(네이티브) 이관 안내.
 *
 * 이 화면은 OTA(EAS Update)로만 배포되므로 수신 대상은 레거시 RN 빌드(4.0.0 미만)뿐이다.
 * 별도 버전 조회가 필요 없는 이유가 여기에 있다 — 4.0 네이티브 앱은 이 번들을 받지 않는다.
 * iOS 전용: Play 스토어 라이브는 아직 레거시(3.3.3)라 안드로이드에는 이관할 4.0이 없다.
 */
const TITLE = '새로워진 픽포미 4.0이 출시되었습니다.';
const MESSAGE =
    '더 안정적이고 편리해진 픽포미 4.0이 출시되었습니다. 현재 버전은 곧 종료될 예정입니다. 새 버전에서는 회원가입을 새로 진행해야 합니다. 앱을 업데이트한 후 회원가입을 완료하고 서비스를 계속 이용해주세요.';
const UPDATE_LABEL = '업데이트하러 가기';
const CLOSE_LABEL = '닫기';
const OPEN_FAILED_MESSAGE = 'App Store를 열지 못했습니다. 잠시 후 다시 시도해주세요.';
const APP_STORE_URL = 'https://apps.apple.com/kr/app/%ED%94%BD%ED%8F%AC%EB%AF%B8/id6450741514';

/**
 * 닫음 상태를 모듈 스코프에 둔다 — 저장소에 남기지 않으므로 앱을 다시 켜면 다시 노출되고(요구사항),
 * 상위 Suspense 재개 등으로 컴포넌트가 remount돼도 같은 실행 중에는 다시 뜨지 않는다.
 */
export const sessionState = { dismissed: false };

const UpdateNoticeModal = () => {
    const [dismissed, setDismissed] = useState(sessionState.dismissed);
    const colorScheme = useColorScheme();
    const titleRef = useRef<RNText>(null);

    const dismiss = () => {
        sessionState.dismissed = true;
        setDismissed(true);
    };

    const visible = Platform.OS === 'ios' && !dismissed;
    const colors = Colors[colorScheme];

    const handleUpdatePress = () => {
        Linking.openURL(APP_STORE_URL).catch(error => {
            console.error('[UpdateNotice] failed to open App Store URL:', error);
            // 무음 실패 금지 — 스크린리더 사용자에게 실패를 고지한다.
            AccessibilityInfo.announceForAccessibility(OPEN_FAILED_MESSAGE);
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            presentationStyle="fullScreen"
            onShow={() => focusOnRef(titleRef, 300)}
            onRequestClose={dismiss}
        >
            <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
                <RNView style={styles.container} accessibilityViewIsModal>
                    <ScrollView contentContainerStyle={styles.content}>
                        {/* 글자 크기는 인앱 설정(Text 컴포넌트)이 정한다 — fontSize를 지정하면 사용자 설정을 덮어쓴다. */}
                        <Text
                            ref={titleRef}
                            accessibilityRole="header"
                            style={[styles.title, { color: colors.text.primary }]}
                        >
                            {TITLE}
                        </Text>
                        <Text style={{ color: colors.text.primary }}>{MESSAGE}</Text>
                    </ScrollView>
                    <RNView style={styles.actions}>
                        {/* 공용 Button은 배경색이 navy 고정이라 다크 배경(#111525)에서 버튼 형태가 묻는다 —
                            여기서는 테마 색을 쓴다(공용 컴포넌트는 건드리지 않는다). */}
                        <TouchableOpacity
                            style={[styles.updateButton, { backgroundColor: colors.button.primary.background }]}
                            onPress={handleUpdatePress}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel={UPDATE_LABEL}
                            accessibilityHint="App Store를 열어 픽포미 4.0으로 업데이트합니다."
                        >
                            <Text style={[styles.updateButtonText, { color: colors.button.primary.text }]}>
                                {UPDATE_LABEL}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.closeButton, { borderColor: colors.border.primary }]}
                            onPress={dismiss}
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel={CLOSE_LABEL}
                            accessibilityHint="안내를 닫고 현재 버전을 계속 사용합니다. 앱을 다시 켜면 다시 안내합니다."
                        >
                            <Text style={{ color: colors.text.primary }}>{CLOSE_LABEL}</Text>
                        </TouchableOpacity>
                    </RNView>
                </RNView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 24
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 24
    },
    title: {
        marginBottom: 16,
        fontWeight: '700'
    },
    actions: {
        gap: 12
    },
    updateButton: {
        width: '100%',
        height: 56,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    updateButtonText: {
        fontWeight: '600'
    },
    closeButton: {
        width: '100%',
        height: 56,
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default UpdateNoticeModal;
