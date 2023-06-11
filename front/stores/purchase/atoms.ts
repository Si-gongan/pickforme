import { atom } from 'jotai';
import { PurchaseProductParams, Product } from './types';
import { PurchaseProductAPI, GetProductsAPI } from './apis';
import { userDataAtom } from '../auth/atoms';

export const productsAtom = atom<Product[]>([]);

export const getProductsAtom = atom(null, async (get, set) => {
  const { data } = await GetProductsAPI();
  set(productsAtom, data);
});
export const purchaseProductAtom = atom(null, async (get, set, params: PurchaseProductParams) => {
  const { data } = await PurchaseProductAPI(params);
  set(userDataAtom, { ...get(userDataAtom), point: data });
});
