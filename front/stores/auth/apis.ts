import client from '../../utils/axios';

import {
  LoginResponse,
  AppleLoginParams,
  KakaoLoginParams,
} from './types';

export const AppleLoginAPI = (params: AppleLoginParams) => client.post<LoginResponse>('/auth/apple',params);
export const KakaoLoginAPI = (params: KakaoLoginParams) => client.post<LoginResponse>('/auth/kakao',params);
