import client from '../../utils/axios';

import {
  LoginResponse,
  AppleLoginParams,
  KakaoLoginParams,
  GoogleLoginParams,
  SetPushTokenParams,
  SetPushSettingParams,
  SetPushSettingResponse,
} from './types';

export const AppleLoginAPI = (params: AppleLoginParams) => client.post<LoginResponse>('/auth/apple', params).catch(error => { console.log(error) });
export const KakaoLoginAPI = (params: KakaoLoginParams) => client.post<LoginResponse>('/auth/kakao', params);
export const GoogleLoginAPI = (params: GoogleLoginParams) => client.post<LoginResponse>('/auth/google', params).catch(error => { console.log(error) });
export const SetPushTokenAPI = (params: SetPushTokenParams) => client.post('/auth/pushtoken', params).catch(error => { console.log(error) });
export const SetPushSettingAPI = (params: SetPushSettingParams) => client.put<SetPushSettingResponse>('/auth/pushsetting', params).catch(error => { console.log(error) });
export const QuitAPI = () => client.post('/auth/quit').catch(error => { console.log(error) });
