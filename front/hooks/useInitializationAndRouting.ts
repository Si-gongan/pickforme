import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { useAtomValue, useSetAtom } from 'jotai';
import { userAtom, settingAtom } from '@stores';
import { setClientToken } from '../utils/axios';
import { GetPopupAPI } from '../stores/auth';
import { PopupService } from '@/services/popup';
import { UserPointAPI } from '@/stores/user/apis';
import { AxiosResponse } from 'axios';
import { UserPoint } from '@/stores/user/types';

export const useInitializationAndRouting = (fontLoaded: boolean) => {
    const user = useAtomValue(userAtom);
    const setUser = useSetAtom(userAtom);
    const setting = useAtomValue(settingAtom);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [isPopupLoading, setIsPopupLoading] = useState(true);
    const [isSettingLoading, setIsSettingLoading] = useState(true);
    const [isHansiryunPopup, setIsHansiryunPopup] = useState(false);
    const isInitialized = useRef(false);

    // 유저 데이터 로딩
    useEffect(() => {
        const checkUser = async () => {
            try {
                await AsyncStorage.getItem('user');
            } finally {
                setIsUserLoading(false);
            }
        };
        checkUser();
    }, []);

    useEffect(() => {
        if (user?.token && user?._id) {
            setClientToken(user.token);

            // 유저 정보 전체 업데이트
            UserPointAPI({})
                .then((response: AxiosResponse<UserPoint>) => {
                    if (response && response.status === 200) {
                        const userData = response.data;
                        if (typeof userData === 'object' && user) {
                            setUser({ ...user, ...userData });
                        }
                    }
                })
                .catch((error: Error) => {
                    console.error('유저 정보 업데이트 실패:', error);
                });
        }
    }, [user?.token, user?._id]);

    // 설정 데이터 로딩
    useEffect(() => {
        const checkSetting = async () => {
            try {
                await AsyncStorage.getItem('setting');
            } finally {
                setIsSettingLoading(false);
            }
        };
        checkSetting();
    }, []);

    // 팝업 데이터 로딩
    useEffect(() => {
        if (isUserLoading) return;

        if (!user?.token || !user?._id) {
            setIsPopupLoading(false);
            return;
        }

        setClientToken(user.token);

        PopupService.checkHansiryunPopup()
            .then(hasPopup => {
                setIsHansiryunPopup(hasPopup);
            })
            .catch(error => {
                console.error('팝업 체크 에러:', error);
            })
            .finally(() => {
                setIsPopupLoading(false);
            });
    }, [user, isUserLoading]);

    // 초기화 및 라우팅 처리
    useEffect(() => {
        if (fontLoaded && !isUserLoading && !isPopupLoading && !isSettingLoading && !isInitialized.current) {
            isInitialized.current = true;

            // 스플래시 스크린 숨기기
            SplashScreen.hideAsync();

            // 라우팅 처리
            if (!user?.token) {
                router.push(setting?.isReady ? '/(tabs)' : '/(onboarding)');
            } else if (isHansiryunPopup) {
                router.push('/(hansiryun)');
            } else {
                router.push('/(tabs)');
            }
        }
    }, [fontLoaded, isUserLoading, isPopupLoading, isSettingLoading, user, setting, isHansiryunPopup]);

    const isTotalLoading = isUserLoading || isPopupLoading || isSettingLoading || !fontLoaded;

    return {
        isUserLoading,
        isPopupLoading,
        isSettingLoading,
        isHansiryunPopup,
        isTotalLoading
    };
};
