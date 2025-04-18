import client from '../../utils/axios';

import {
    LoginResponse,
    AppleLoginParams,
    KakaoLoginParams,
    GoogleLoginParams,
    SetPushTokenParams,
    SetPushSettingParams,
    SetPushSettingResponse,
    phoneCheckParams,
    SetPopupParams
} from './types';

export const AppleLoginAPI = (params: AppleLoginParams) =>
    client.post<LoginResponse>('/auth/apple', params).catch(error => {
        console.log(error);
    });
export const KakaoLoginAPI = (params: KakaoLoginParams) => client.post<LoginResponse>('/auth/kakao', params);
export const GoogleLoginAPI = (params: GoogleLoginParams) =>
    client.post<LoginResponse>('/auth/google', params).catch(error => {
        console.log(error);
    });
export const SetPushTokenAPI = (params: SetPushTokenParams) =>
    client.post('/auth/pushtoken', params).catch(error => {
        console.log(error);
    });
export const SetPushSettingAPI = (params: SetPushSettingParams) =>
    client.put<SetPushSettingResponse>('/auth/pushsetting', params).catch(error => {
        console.log(error);
    });
export const QuitAPI = () =>
    client.post('/auth/quit').catch(error => {
        console.log(error);
    });
export const PhoneCheckAPI = async ({ id, phone }: phoneCheckParams) => {
    console.log('API 호출:', { phone });
    const response = await client.post('/user/duplicationphone', { phone });
    console.log('API 응답:', response.data);
    return response;
};

export const SetPopupAPI = (params: SetPopupParams) => client.post('/user/setpopup', params);
export const GetPopupAPI = () => client.get('/popup/active');

export const PhoneSubmitAPI = async ({ id, phone }: phoneCheckParams) => {
    console.log('API 호출:', { id, phone });
    const response = await client.post('/user/phone', { id, phone });
    console.log('API 응답:', response.data);
    return response;
};
