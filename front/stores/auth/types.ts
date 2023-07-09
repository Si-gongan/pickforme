export interface UserData {
  _id: string,
  token: string,
  point: number,
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
