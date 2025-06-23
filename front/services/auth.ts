import { useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useAuthRequest as useGoogleAuthRequest } from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

import { userAtom, modalAtom } from '@stores';
import client from '../utils/axios';
import { changeToken } from '../utils/axios';

import type { IAppleAuthPayload, ILogin, IServiceProps, IBaseAuthPayload } from '@types';

export function useServiceLogin({ onSuccess }: Partial<IServiceProps> = {}) {
    const onUser = useSetAtom(userAtom);
    const onModal = useSetAtom(modalAtom);

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
            console.log('서버 API 호출 시작:', payload);
            return client.post<ILogin>('/auth/kakao', payload);
        },
        onSuccess: async function (response) {
            console.log('서버 응답 성공:', response);
            if (response.status === 200) {
                console.log('로그인 데이터:', response.data);
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

    const redirectUri = makeRedirectUri({
        scheme: 'com.sigonggan.pickforme'
    });

    console.log('리디렉션 URI:', redirectUri);

    const [_, googleResult, googleBase] = useGoogleAuthRequest({
        clientId: '618404683764-44mvv1k1mpsin7s7uiqmcn3h1n7sravc.apps.googleusercontent.com',
        androidClientId: '618404683764-vc6iaucqdo8me4am0t9062d01800q0cr.apps.googleusercontent.com',
        iosClientId: '618404683764-e4rl4qllc10k93lgs2bv7vbv9j1lruu7.apps.googleusercontent.com',
        redirectUri
    });

    useEffect(
        function () {
            if (googleResult?.type === 'success' && (googleResult as any).authentication) {
                const {
                    authentication: { accessToken }
                } = googleResult as any;
                mutateGoogleLogin({ accessToken });
            } else if (googleResult?.type === 'dismiss') {
                console.log('Google 인증이 취소되었습니다.');
            } else if (googleResult?.type === 'error') {
                console.error('Google 인증 에러:', googleResult.error);
            } else if (googleResult?.type) {
                console.log('Google 인증 상태:', googleResult.type);
            }
        },
        [googleResult, mutateGoogleLogin]
    );

    return {
        mutateKakaoLogin,
        mutateAppleLogin,
        mutateGoogleLogin: googleBase,
        isPending: isPendingAppleLogin || isPendingKakaoLogin || isPendingGoogleLogin
    };
}
