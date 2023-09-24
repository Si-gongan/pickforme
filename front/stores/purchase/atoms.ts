import { atom } from 'jotai';
import { PickHistory, GetProductsParams, PurchaseProductParams, Product, Purchase } from './types';
import { PurchaseProductAPI, GetProductsAPI, GetSubscriptionAPI, GetPickHistoryAPI } from './apis';
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
export const subscriptionAtom = atom<Purchase | null>(null);
export const getSubscriptionAtom = atom(null, async (get, set) => {
  const { data } = await GetSubscriptionAPI();
  set(subscriptionAtom, data);
});

export const pickHistoryAtom = atom<PickHistory[] | null>(null);
export const getPickHistoryAtom = atom(null, async (get, set) => {
  const { data } = await GetPickHistoryAPI();
  set(pickHistoryAtom, data);
});

