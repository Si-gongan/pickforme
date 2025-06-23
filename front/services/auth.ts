import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';

import { userAtom, modalAtom } from '@stores';
import client from '../utils/axios';
import { changeToken } from '../utils/axios';

import type { IAppleAuthPayload, ILogin, IServiceProps, IBaseAuthPayload } from '@types';

export function useServiceLogin({ onSuccess }: Partial<IServiceProps> = {}) {
    const onUser = useSetAtom(userAtom);
    const onModal = useSetAtom(modalAtom);

    // Google Sign-In 설정
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '618404683764-44mvv1k1mpsin7s7uiqmcn3h1n7sravc.apps.googleusercontent.com',
            offlineAccess: true,
            hostedDomain: '',
            forceCodeForRefreshToken: true
        });
    }, []);

    const onLogin = useCallback(
        async function (data: ILogin) {
            const userData = data.user;
            await onUser(userData || {});
            if (!!userData) {
                changeToken(userData?.token);
            }
            onModal(function (prev) {
                return {
                    ...prev,
                    loginModal: false,
                    greetingModal: data?.isNewLoginInEvent || false
                };
            });
        },
        [onUser, onModal]
    );

    const { mutateAsync: mutateKakaoLogin, isPending: isPendingKakaoLogin } = useMutation({
        mutationKey: ['mutateKakaoLogin'],
        mutationFn: function (payload: IBaseAuthPayload) {
            return client.post<ILogin>('/auth/kakao', payload);
        },
        onSuccess: async function (response) {
            if (response.status === 200) {
                await onLogin(response.data);
                onSuccess?.();
            }
        },
        onError: function (error) {
            console.error('서버 API 에러:', error);
        }
    });

    const { mutateAsync: mutateAppleLogin, isPending: isPendingAppleLogin } = useMutation({
        mutationKey: ['mutateAppleLogin'],
        mutationFn: function (payload: IAppleAuthPayload) {
            return client.post<ILogin>('/auth/apple', payload);
        },
        onSuccess: async function (response) {
            if (response.status === 200) {
                await onLogin(response.data);
                onSuccess?.();
            }
        },
        onError: function (error) {
            console.log('error', error);
        }
    });

    const { mutateAsync: mutateGoogleLogin, isPending: isPendingGoogleLogin } = useMutation({
        mutationKey: ['mutateGoogleLogin'],
        mutationFn: function (payload: IBaseAuthPayload) {
            return client.post<ILogin>('/auth/google', payload);
        },
        onSuccess: async function (response) {
            if (response.status === 200) {
                await onLogin(response.data);
                onSuccess?.();
            }
        },
        onError: function (error) {
            console.error('Google 로그인 에러:', error);
        }
    });

    // Google 로그인 함수
    const handleGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            // accessToken 추출
            const tokens = await GoogleSignin.getTokens();

            if (tokens.accessToken) {
                await mutateGoogleLogin({ accessToken: tokens.accessToken });
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('Google 로그인이 취소되었습니다.');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log('Google 로그인이 진행 중입니다.');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log('Play Services를 사용할 수 없습니다.');
            } else {
                console.log('Google 로그인 중 알 수 없는 오류가 발생했습니다.');
            }
        }
    };

    return {
        mutateKakaoLogin,
        mutateAppleLogin,
        mutateGoogleLogin: handleGoogleLogin,
        isPending: isPendingAppleLogin || isPendingKakaoLogin || isPendingGoogleLogin
    };
}
