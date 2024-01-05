import { atom } from 'jotai';
import { DiscoverState } from './types';
import { GetMainProductsAPI } from './apis';

export const mainProductsAtom = atom<DiscoverState>({
  special: [],
  random: [],
  reports: [],
});

export const getMainProductsAtom = atom(null, async (get, set) => {
  const { data } = await GetMainProductsAPI();
  set(mainProductsAtom, data);
});
