import { atom } from 'jotai';
import { Alert } from 'react-native';
import { atomWithStorage } from '../utils';
import { setClientToken } from '../../utils/axios';
import {
  UserData,
  LoginResponse,
  Setting,
  GoogleLoginParams,
  AppleLoginParams,
  KakaoLoginParams,
  SetPushTokenParams,
  SetPushSettingParams,
} from './types';
import { QuitAPI, GoogleLoginAPI, AppleLoginAPI, KakaoLoginAPI, SetPushTokenAPI, SetPushSettingAPI } from './apis';
// import { requestsAtom } from '../request/atoms';

export const isOnboardingFinishedAtom = atomWithStorage<'true' | 'false'>('isOnboardingFinished', 'false');
export const isLoadedAtom = atomWithStorage<'true' | 'false'>('isLoaded', 'false');

export const settingAtom = atomWithStorage<Setting>('setting', {
  isReady: false,
});
export const userDataAtom = atomWithStorage<UserData | void>('userData', undefined);
export const setPointAtom = atom(null, async (get, set, data: number) => {
  const userData = await get(userDataAtom);
  if (!userData) {
    return;
  }
  set(userDataAtom, { ...userData, point: data });
});

export const quitAtom = atom(null, async (get, set) => {
  await QuitAPI();
  set(userDataAtom, undefined);
  // set(requestsAtom, []);
  Alert.alert('탈퇴가 완료되었습니다.');
});

export const logoutAtom = atom(null, async (get, set) => {
  set(userDataAtom, undefined);
  // set(requestsAtom, []);
  Alert.alert('로그아웃 되었습니다.');
});

export const setClientTokenAtom = atom(null, async (get, set) => {
  const userData = await get(userDataAtom);
  if (!userData) {
    return;
  }
  setClientToken(userData.token);
});

export const handleLoginResultAtom = atom(null, async (get, set, data: LoginResponse) => {
  await set(userDataAtom, data.user);
  set(isShowLoginModalAtom, false);
  if (data.isNewLoginInEvent) {
    set(isShowGreetingModalAtom, true);
  }
  set(setClientTokenAtom);
});

export const loginGoogleAtom = atom(null, async (get, set, params: GoogleLoginParams) => {
  const { data } = await GoogleLoginAPI(params);
  set(handleLoginResultAtom, data);
});

export const loginAppleAtom = atom(null, async (get, set, params: AppleLoginParams) => {
  const { data } = await AppleLoginAPI(params);
  set(handleLoginResultAtom, data);
});

export const loginKakaoAtom = atom(null, async (get, set, params: KakaoLoginParams) => {
  const { data } = await KakaoLoginAPI(params);
  set(handleLoginResultAtom, data);
});

export const setPushTokenAtom = atom(null, async (get, set, params: SetPushTokenParams) => {
  await SetPushTokenAPI(params);
});

export const setPushSettingAtom = atom(null, async (get, set, params: SetPushSettingParams) => {
  const userData = await get(userDataAtom);
  if (userData) {
    const { data } = await SetPushSettingAPI(params);
    set(userDataAtom, { ...userData, push: data });
  }
});

export const isShowLoginModalAtom = atom(false);
export const isShowOnboardingModalAtom = atom(false);
export const isShowLackPointModalAtom = atom(false);
export const isShowGreetingModalAtom = atom(false);

// 2024
export const isShowVersionUpdateAlarmModalAtom = atom(false);
export const isShowIntroduceAlertAtom = atom(false);
