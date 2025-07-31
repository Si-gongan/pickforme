import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
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
    const [isSettingLoading, setIsSettingLoading] = useState(true);
    const isInitialized = useRef(false);
    const router = useRouter();

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

    useEffect(() => {
        if (isUserLoading) return;

        if (!user?.token || !user?._id) {
            return;
        }

        setClientToken(user.token);
    }, [user, isUserLoading]);

    // 초기화 및 라우팅 처리
    useEffect(() => {
        if (fontLoaded && !isUserLoading && !isSettingLoading && !isInitialized.current) {
            isInitialized.current = true;

            // 라우팅 처리
            if (!user?.token) {
                router.push(setting?.isReady ? '/(tabs)' : '/(onboarding)');
            } else {
                router.push('/(tabs)');
            }
        }
    }, [fontLoaded, isUserLoading, isSettingLoading, user, setting]);

    const isTotalLoading = isUserLoading || isSettingLoading || !fontLoaded;

    return {
        isUserLoading,
        isSettingLoading,
        isTotalLoading
    };
};
