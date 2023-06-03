import { atom } from 'jotai';
import { atomWithStorage } from '../utils';
import { UserData, Setting } from './types';

export const settingAtom = atomWithStorage<Setting>('setting', {
  isReady: false,
});
export const userDataAtom = atomWithStorage<UserData | void>('userData', undefined);

const MOCK_USER_DATA = {
  id: '13qd1',
  point: 1200,
}

export const loginAtom = atom(null, (get, set, { token }: { token: string }) => {
  // token으로 서버로그인
  set(userDataAtom, { ...MOCK_USER_DATA, token });
});
