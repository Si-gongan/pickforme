import { atom } from 'jotai';
import { atomWithStorage } from '../utils';
import { setClientToken } from '../../utils/axios';
import {
  UserData,
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

export const setClientTokenAtom = atom(null, (get, set) => {
  const userData = get(userDataAtom);
  if (!userData) {
    return;
  }
  setClientToken(userData.token);
});
export const handleLoginResultAtom = atom(null, (get, set, data: UserData) => {
  set(userDataAtom, data);
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
