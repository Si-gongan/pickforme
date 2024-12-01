export interface UserData {
  _id: string,
  token: string,
  point: number,
  aiPoint: number,
  lastLoginAt: string,
  push: {
    service: PushService;
  }
}

export interface Setting {
  name?: string,
  vision?: 'none' | 'low' | 'blind',
  theme?: 'light' | 'dark' | 'default',
  isReady: boolean,
}

export interface AppleLoginParams {
  identityToken: string,
}
export interface KakaoLoginParams {
  accessToken: string,
}
export interface GoogleLoginParams {
  accessToken: string,
}

export interface LoginResponse {
  user: UserData;
  isRegister: boolean;
  isNewLoginInEvent: boolean,
}
export interface SetPushTokenParams {
  token: string;
}

export enum PushService {
  on = 'on',
  off = 'off',
}

export type SetPushSettingParams = UserData['push'];
export type SetPushSettingResponse = SetPushSettingParams;
