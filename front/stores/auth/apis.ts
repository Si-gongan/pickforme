import client from '../../utils/axios';

import {
  UserData,
  AppleLoginParams,
  KakaoLoginParams,
} from './types';

export const AppleLoginAPI = (params: AppleLoginParams) => client.post<UserData>('/auth/apple',params);
export const KakaoLoginAPI = (params: KakaoLoginParams) => client.post<UserData>('/auth/kakao',params);
