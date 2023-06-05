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

export const settingAtom = atomWithStorage<Setting>('setting', {
  isReady: false,
});
export const userDataAtom = atomWithStorage<UserData | void>('userData', undefined);

export const handleLoginResultAtom = atom(null, (get, set, data: UserData) => {
  setClientToken(data.token);
  set(userDataAtom, data);
});

export const loginAppleAtom = atom(null, async (get, set, params: AppleLoginParams) => {
  const { data } = await AppleLoginAPI(params);
  set(handleLoginResultAtom, data);
});

const MOCK_USER_DATA = {
  _id: '13qd1',
  point: 1200,
}
export const loginKakaoAtom = atom(null, async (get, set, params: KakaoLoginParams) => {
  const { data } = await KakaoLoginAPI(params);
  set(handleLoginResultAtom, data);
});

export const isShowLoginModalAtom = atom(false);
export const isShowLackModalAtom = atom(false);
