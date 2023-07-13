export interface UserData {
  _id: string,
  token: string,
  point: number,
  push: {
    chat: PushChat;
    service: PushService;
  }
}

export interface Setting {
  name?: string,
  fontSize?: 'small' | 'medium' | 'large',
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

export interface LoginResponse {
  user: UserData;
  isRegister: boolean;
}
export interface SetPushTokenParams {
  token: string;
}

export enum PushChat {
  off = 'off',
  report = 'report',
  all = 'all',
}

export enum PushService {
  on = 'on',
  off = 'off',
}

export type SetPushSettingParams = UserData['push'];
export type SetPushSettingResponse = SetPushSettingParams;
