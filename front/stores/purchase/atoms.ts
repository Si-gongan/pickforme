import { atom } from 'jotai';
import { GetProductsParams, PurchaseProductParams, Product, Purchase, PurchaseSubCheck } from './types';
import { UserPoint } from '../user/types';
import {
    PurchaseProductAPI,
    GetProductsAPI,
    GetSubscriptionAPI,
    GetSubscriptionListAPI,
    GetPurchaseListAPI,
    GetPurchaseCheckAPI,
    GetPurchaseSubCheckAPI
} from './apis';
import { userDataAtom } from '../auth/atoms';
import { atomWithStorage } from '../utils';
import { Alert } from 'react-native';
import { UserPointAPI } from '../user/apis';

export const productsAtom = atom<Product[]>([]);

export const getProductsAtom = atom(null, async (get, set, params: GetProductsParams) => {
    const { data } = await GetProductsAPI(params);
    set(productsAtom, data);
});
export const purchaseProductAtom = atom(null, async (get, set, params: PurchaseProductParams) => {
    const response = await PurchaseProductAPI(params);
    if (!response) return;

    const { data, status } = response;
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
    const pointResponse = await UserPointAPI({});
    if (!pointResponse || pointResponse.status !== 200) {
        return;
    }
    const pointData = pointResponse.data as UserPoint;
    set(userDataAtom, { ...userData, point: pointData.point, aiPoint: pointData.aiPoint });
});

export const subscriptionAtom = atom<Purchase | null>(null);
export const getSubscriptionAtom = atom(null, async (get, set) => {
    const response = await GetSubscriptionAPI();
    if (response) {
        set(subscriptionAtom, response.data);
    } else {
        set(subscriptionAtom, null);
    }
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

export const purchasSubCheckAtom = atomWithStorage<PurchaseSubCheck | void>('purchaseSubCheck', undefined);

export const purchasSubCheckAtom2 = atom<PurchaseSubCheck[] | null>(null);

// export const purchasSubCheckAtom2 = atomWithStorage<PurchaseSubCheck | null>("subCheck",null);
export const getPurchasSubCheckAtom = atom(null, async (get, set) => {
    // const purchasSubCheck = await get(purchasSubCheckAtom);
    // if (!purchasSubCheck) {
    //   return;
    // }
    // set(purchasSubCheckAtom, { ...purchasSubCheck });

    try {
        const { data } = await GetPurchaseSubCheckAPI();
        set(purchasSubCheckAtom, data);
    } catch (error) {
        console.error('구독 확인 API 호출 중 오류 발생:', error);
    }
});
