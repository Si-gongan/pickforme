import { atom } from 'jotai';
import { GetProductsParams, PurchaseProductParams, Product, Purchase } from './types';
import { PurchaseProductAPI, GetProductsAPI, GetSubscriptionAPI, GetSubscriptionListAPI, GetPurchaseListAPI } from './apis';
import { userDataAtom } from '../auth/atoms';
import { Alert } from 'react-native';

export const productsAtom = atom<Product[]>([]);

export const getProductsAtom = atom(null, async (get, set, params: GetProductsParams) => {
  const { data } = await GetProductsAPI(params);
  set(productsAtom, data);
});
export const purchaseProductAtom = atom(null, async (get, set, params: PurchaseProductParams) => {
  const { data, status } = await PurchaseProductAPI(params);
  const userData = await get(userDataAtom);
  if (!userData) {
    return;
  }
  if (typeof data === 'string') {
    Alert.alert(data as string);
    return;
  }
  if (status !== 200) {
    return;
  }
  set(userDataAtom, { ...userData, point: userData.point + data.product.point });
});
export const subscriptionAtom = atom<Purchase | null>(null);
export const getSubscriptionAtom = atom(null, async (get, set) => {
  const { data } = await GetSubscriptionAPI();
  set(subscriptionAtom, data);
});

export const subscriptionListAtom = atom<Purchase[] | null>(null);
export const getSubscriptionListAtom = atom(null, async (get, set) => {
  const { data } = await GetSubscriptionListAPI();
  set(subscriptionListAtom, data);
});

export const purchaseListAtom = atom<Purchase[] | null>(null);
export const getPurchaseListAtom = atom(null, async (get, set) => {
  const { data } = await GetPurchaseListAPI();
  set(purchaseListAtom, data);
});


