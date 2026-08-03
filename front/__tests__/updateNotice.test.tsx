import React from 'react';
import { Linking, Platform, TouchableOpacity } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

const TITLE = '새로워진 픽포미 4.0이 출시되었습니다.';
const MESSAGE =
    '더 안정적이고 편리해진 픽포미 4.0이 출시되었습니다. 현재 버전은 곧 종료될 예정입니다. 새 버전에서는 회원가입을 새로 진행해야 합니다. 앱을 업데이트한 후 회원가입을 완료하고 서비스를 계속 이용해주세요.';
const APP_STORE_URL = 'https://apps.apple.com/kr/app/%ED%94%BD%ED%8F%AC%EB%AF%B8/id6450741514';

import UpdateNoticeModal, { sessionState } from '@/components/UpdateNoticeModal';

// 닫음 상태는 모듈 스코프(=앱 실행 단위)라 테스트마다 초기화한다(앱 재실행과 동등).
const renderNotice = () => render(<UpdateNoticeModal />);

// 핸들러가 달린 TouchableOpacity를 직접 누르고, 상태 갱신을 flush한다.
const pressButton = (label: string) =>
    act(() => {
        fireEvent.press(screen.UNSAFE_getAllByType(TouchableOpacity).find(t => t.props.accessibilityLabel === label)!);
    });

describe('UpdateNoticeModal', () => {
    const originalPlatform = Platform.OS;

    beforeEach(() => {
        (Platform as any).OS = 'ios';
        sessionState.dismissed = false;
        jest.clearAllMocks();
        jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    });

    afterEach(() => {
        (Platform as any).OS = originalPlatform;
        jest.restoreAllMocks();
    });

    it('iOS에서 owner 승인 문구 그대로 노출한다', () => {
        renderNotice();

        expect(screen.getByText(TITLE)).toBeTruthy();
        expect(screen.getByText(MESSAGE)).toBeTruthy();
        expect(screen.getByLabelText('업데이트하러 가기')).toBeTruthy();
        expect(screen.getByLabelText('닫기')).toBeTruthy();
    });

    it('업데이트 버튼이 지정된 App Store URL을 연다', () => {
        renderNotice();

        pressButton('업데이트하러 가기');

        expect(Linking.openURL).toHaveBeenCalledTimes(1);
        expect(Linking.openURL).toHaveBeenCalledWith(APP_STORE_URL);
    });

    // RN Modal은 네이티브 onDismiss 없이는 테스트 환경에서 제자리 갱신이 관측되지 않는다.
    // 닫기의 계약(= 이번 실행 동안 다시 뜨지 않는다)을 세션 플래그로 검증한다.
    it('닫기는 이번 실행의 닫음 상태만 기록한다(스토어로 보내지 않는다)', () => {
        renderNotice();

        pressButton('닫기');

        expect(sessionState.dismissed).toBe(true);
        expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('닫은 뒤 재마운트되면 노출하지 않는다(다시 켜면 초기화)', () => {
        sessionState.dismissed = true;

        renderNotice();

        expect(screen.queryByLabelText('닫기')).toBeNull();
        expect(screen.queryByText(TITLE)).toBeNull();
    });

    it('Android에서는 노출하지 않는다 (Play 라이브가 아직 레거시라 이관 대상 없음)', () => {
        (Platform as any).OS = 'android';

        renderNotice();

        expect(screen.queryByText(TITLE)).toBeNull();
    });
});
