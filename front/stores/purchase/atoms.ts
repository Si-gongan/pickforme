import { atom } from 'jotai';
import { GetProductsParams, PurchaseProductParams, Product } from './types';
import { PurchaseProductAPI, GetProductsAPI } from './apis';
import { userDataAtom } from '../auth/atoms';

export const productsAtom = atom<Product[]>([]);

export const getProductsAtom = atom(null, async (get, set, params: GetProductsParams) => {
  const { data } = await GetProductsAPI(params);
  set(productsAtom, data);
});
export const purchaseProductAtom = atom(null, async (get, set, params: PurchaseProductParams) => {
  const { data } = await PurchaseProductAPI(params);
  const userData = await get(userDataAtom)
  if (userData) {
    set(userDataAtom, { ...userData, point: data });
  }
});
