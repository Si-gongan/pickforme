import client from '../../utils/axios';

import {
  LoginResponse,
  AppleLoginParams,
  KakaoLoginParams,
  SetPushTokenParams,
  SetPushSettingParams,
  SetPushSettingResponse,
} from './types';

export const AppleLoginAPI = (params: AppleLoginParams) => client.post<LoginResponse>('/auth/apple',params);
export const KakaoLoginAPI = (params: KakaoLoginParams) => client.post<LoginResponse>('/auth/kakao',params);
export const SetPushTokenAPI = (params: SetPushTokenParams) => client.post('/auth/pushtoken', params);
export const SetPushSettingAPI = (params: SetPushSettingParams) => client.put<SetPushSettingResponse>('/auth/pushsetting', params);
