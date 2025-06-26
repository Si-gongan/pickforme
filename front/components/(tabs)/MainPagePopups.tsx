import HansiryunPopup from '@/components/HansiryunPopup';
import { PopupService } from '@/services/popup';
import React from 'react';

import { useCheckIsFirstLogin } from '@/hooks/useCheckIsFirstLogin';
import { usePopupSystem } from '@/hooks/usePopupSystem';
import { How } from '@components';

import Modal from 'react-native-modal';

import { useEffect } from 'react';
import { Linking } from 'react-native';
import Survey from './popups/Survey';

const MainPagePopups = () => {
    const [isHowModalVisible, setIsHowModalVisible] = React.useState(false);
    const [isSurveyVisible, setIsSurveyVisible] = React.useState(false);
    const { isFirstLogin } = useCheckIsFirstLogin();
    const { registerPopup, showNextPopup, handlePopupClose, isRegistered } = usePopupSystem();
    const [isHansiryunVisible, setIsHansiryunVisible] = React.useState(false);
    // 팝업 등록
    useEffect(() => {
        registerPopup({
            id: 'how',
            shouldShow: async () => {
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
        registerPopup({
            id: 'hansiryun',
            shouldShow: async () => {
                return PopupService.checkHansiryunPopup()
                    .then(hasPopup => {
                        return hasPopup;
                    })
                    .catch(error => {
                        console.error('한시련 팝업 체크 에러:', error);
                        return false;
                    });
            },
            onShow: () => {
                setTimeout(() => {
                    setIsHansiryunVisible(true);
                }, 300);
            },
            onClose: () => {
                setIsHansiryunVisible(false);
            },
            priority: 0
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
            >
                <How visible={isHowModalVisible} onClose={handlePopupClose} />
            </Modal>

            <Modal
                isVisible={isHansiryunVisible}
                onBackButtonPress={handlePopupClose}
                onBackdropPress={handlePopupClose}
                animationIn="slideInUp"
                animationInTiming={300}
                style={{ justifyContent: 'flex-end', margin: 0 }}
            >
                <HansiryunPopup visible={isHansiryunVisible} onClose={handlePopupClose} />
            </Modal>
        </>
    );
};

export default MainPagePopups;
