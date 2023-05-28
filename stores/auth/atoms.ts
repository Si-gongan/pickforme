import { atomWithStorage } from '../utils';
import { UserData, Setting } from './types';

export const settingAtom = atomWithStorage<Setting>('setting', {
  isReady: false,
});
export const userDataAtom = atomWithStorage<UserData | void>('userData', undefined);

