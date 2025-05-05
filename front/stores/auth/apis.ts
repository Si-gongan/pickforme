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
    SetPopupParams,
    Popup
} from './types';

export const AppleLoginAPI = (params: AppleLoginParams) => client.post<LoginResponse>('/auth/apple', params);
export const KakaoLoginAPI = (params: KakaoLoginParams) => client.post<LoginResponse>('/auth/kakao', params);
export const GoogleLoginAPI = (params: GoogleLoginParams) => client.post<LoginResponse>('/auth/google', params);
export const SetPushTokenAPI = (params: SetPushTokenParams) => client.post('/auth/pushtoken', params);
export const SetPushSettingAPI = (params: SetPushSettingParams) =>
    client.put<SetPushSettingResponse>('/auth/pushsetting', params);
export const QuitAPI = () => client.post('/auth/quit');
export const PhoneCheckAPI = async ({ id, phone }: phoneCheckParams) => {
    const response = await client.post('/user/duplicationphone', { phone });
    return response;
};

export const SetPopupAPI = (params: SetPopupParams) => client.post('/user/setpopup', params);
export const GetPopupAPI = () => client.get<Popup[]>('/popup/active');

export const PhoneSubmitAPI = async ({ id, phone }: phoneCheckParams) => {
    const response = await client.post('/user/phone', { id, phone });
    return response;
};
