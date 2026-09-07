import React from 'react';
import { Linking, Platform, TouchableOpacity } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import UpdateNoticeModal, {
    APP_STORE_URL,
    MESSAGE,
    OS_UPDATE_MESSAGE,
    TITLE,
    UPDATE_LABEL,
    iosMajorVersion
} from '@/components/UpdateNoticeModal';

const renderNotice = (iosMajor = 17) => render(<UpdateNoticeModal iosMajor={iosMajor} />);

// 핸들러가 달린 TouchableOpacity를 직접 누르고, 상태 갱신을 flush한다.
const pressButton = (label: string) =>
    act(() => {
        fireEvent.press(screen.UNSAFE_getAllByType(TouchableOpacity).find(t => t.props.accessibilityLabel === label)!);
    });

describe('UpdateNoticeModal (강제 이관 · dismiss 불가)', () => {
    const originalPlatform = Platform.OS;

    beforeEach(() => {
        (Platform as any).OS = 'ios';
        jest.clearAllMocks();
        jest.spyOn(Linking, 'openURL').mockResolvedValue(true as any);
    });

    afterEach(() => {
        (Platform as any).OS = originalPlatform;
        jest.restoreAllMocks();
    });

    it('iOS에서 owner 승인 문구 그대로 노출하고 닫기 버튼이 없다', () => {
        renderNotice();
        expect(screen.getByText(TITLE)).toBeTruthy();
        expect(screen.getByText(MESSAGE)).toBeTruthy();
        expect(screen.getByLabelText(UPDATE_LABEL)).toBeTruthy();
        expect(screen.queryByLabelText('닫기')).toBeNull();
    });

    it('iOS 17 이상에서는 OS 업데이트 안내를 붙이지 않는다', () => {
        renderNotice();
        expect(screen.queryByText(OS_UPDATE_MESSAGE)).toBeNull();
    });

    it('iOS 17 미만에서는 OS 업데이트 안내를 덧붙인다(차단은 동일)', () => {
        renderNotice(16);
        expect(screen.getByText(OS_UPDATE_MESSAGE)).toBeTruthy();
        expect(screen.getByLabelText(UPDATE_LABEL)).toBeTruthy();
        expect(screen.queryByLabelText('닫기')).toBeNull();
    });

    it('버전 파싱 실패 시 0으로 보고 OS 안내를 함께 보여 무음 실패를 피한다', () => {
        jest.spyOn(Platform, 'Version', 'get').mockReturnValue('unknown' as any);
        expect(iosMajorVersion()).toBe(0);
        render(<UpdateNoticeModal />);
        expect(screen.getByText(OS_UPDATE_MESSAGE)).toBeTruthy();
    });

    it('업데이트 버튼이 지정된 App Store URL을 연다', () => {
        renderNotice();
        pressButton(UPDATE_LABEL);
        expect(Linking.openURL).toHaveBeenCalledTimes(1);
        expect(Linking.openURL).toHaveBeenCalledWith(APP_STORE_URL);
    });

    it('Android에서는 노출하지 않는다 (Play 라이브가 아직 레거시라 이관 대상 없음)', () => {
        (Platform as any).OS = 'android';
        renderNotice();
        expect(screen.queryByText(TITLE)).toBeNull();
    });
});
