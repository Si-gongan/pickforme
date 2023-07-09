import { atom } from 'jotai';
import { atomWithStorage } from '../utils';
import { setClientToken } from '../../utils/axios';
import {
  UserData,
  LoginResponse,
  Setting,
  AppleLoginParams,
  KakaoLoginParams,
} from './types';
import { AppleLoginAPI, KakaoLoginAPI } from './apis';

export const isLoadedAtom = atomWithStorage<'true' | 'false'>('isLoaded', 'false');

export const settingAtom = atomWithStorage<Setting>('setting', {
  isReady: false,
});
export const userDataAtom = atomWithStorage<UserData | void>('userData', undefined);

export const setClientTokenAtom = atom(null, async (get, set) => {
  const userData = await get(userDataAtom);
  if (!userData) {
    return;
  }
  setClientToken(userData.token);
});
export const handleLoginResultAtom = atom(null, async (get, set, data: LoginResponse) => {
  await set(userDataAtom, data.user);
  if (data.isRegister) {
    set(isShowGreetingModalAtom, true);
  }
  set(setClientTokenAtom);
});

export const loginAppleAtom = atom(null, async (get, set, params: AppleLoginParams) => {
  const { data } = await AppleLoginAPI(params);
  set(handleLoginResultAtom, data);
});

export const loginKakaoAtom = atom(null, async (get, set, params: KakaoLoginParams) => {
  const { data } = await KakaoLoginAPI(params);
  set(handleLoginResultAtom, data);
});

export const isShowLoginModalAtom = atom(false);
export const isShowLackModalAtom = atom(false);
export const isShowGreetingModalAtom = atom(false);
