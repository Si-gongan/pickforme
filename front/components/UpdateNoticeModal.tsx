import { useRef } from 'react';
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
 * 픽포미 4.0(네이티브) 강제 이관 화면 — iOS 레거시 전용, dismiss 불가.
 *
 * 이 화면은 OTA(EAS Update)로만 배포되므로 수신 대상은 레거시 RN 빌드(4.0.0 미만)뿐이다.
 * 별도 버전 조회가 필요 없는 이유가 여기에 있다 — 4.0 네이티브 앱은 이 번들을 받지 않는다.
 * iOS 전용: Play 스토어 라이브는 아직 레거시(3.3.3)라 안드로이드에는 이관할 4.0이 없다.
 *
 * owner 결정 2026-09-07: 닫기 없이 전부 차단. 4.0 최소 iOS 17이라 iOS 17 미만 기기에는
 * OS 업데이트가 먼저 필요하다는 안내를 덧붙인다(같은 화면, 같은 차단).
 * 서버 측 백스톱(레거시 백엔드가 iOS 요청을 410으로 거절)이 함께 켜지므로 이 화면을 우회해도 서비스는 동작하지 않는다.
 */
export const TITLE = '픽포미 4.0으로 업데이트해주세요';
export const MESSAGE =
    '현재 버전은 서비스가 종료되었습니다. App Store에서 픽포미 4.0으로 업데이트한 뒤 회원가입을 새로 진행해주세요.';
export const OS_UPDATE_MESSAGE =
    '이 기기의 iOS 버전에서는 픽포미 4.0을 설치할 수 없습니다. 설정, 일반, 소프트웨어 업데이트에서 iOS 17 이상으로 업데이트한 뒤 App Store에서 픽포미 4.0을 설치해주세요.';
export const UPDATE_LABEL = '업데이트하러 가기';
export const OPEN_FAILED_MESSAGE = 'App Store를 열지 못했습니다. 잠시 후 다시 시도해주세요.';
export const APP_STORE_URL = 'https://apps.apple.com/kr/app/%ED%94%BD%ED%8F%AC%EB%AF%B8/id6450741514';
/** 픽포미 4.0 최소 iOS 버전 — 이 값 미만이면 OS 업데이트 안내를 덧붙인다. */
export const MIN_IOS_MAJOR = 17;

/** iOS 메이저 버전. 파싱 실패 시 0(= OS 안내를 함께 보여 무음 실패를 피한다). */
export const iosMajorVersion = (): number => {
    const raw = Platform.Version;
    const major = parseInt(String(raw).split('.')[0], 10);
    return Number.isFinite(major) ? major : 0;
};

type Props = {
    /** 테스트 주입용 — 기본은 실행 중인 기기의 iOS 메이저 버전. */
    iosMajor?: number;
};

const UpdateNoticeModal = ({ iosMajor }: Props = {}) => {
    const colorScheme = useColorScheme();
    const titleRef = useRef<RNText>(null);

    const visible = Platform.OS === 'ios';
    const needsOsUpdate = visible && (iosMajor ?? iosMajorVersion()) < MIN_IOS_MAJOR;
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
            // dismiss 불가 — iOS 에는 하드웨어 back 이 없고, 제스처 dismiss 는 fullScreen 에서 동작하지 않는다.
            onRequestClose={() => undefined}
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
                        {needsOsUpdate ? (
                            <Text style={[styles.osNotice, { color: colors.text.primary }]}>{OS_UPDATE_MESSAGE}</Text>
                        ) : null}
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
    osNotice: {
        marginTop: 16
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
    }
});

export default UpdateNoticeModal;
