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
import { userAtom } from '../user';
import { atomWithStorage } from '../utils';
import { Alert } from 'react-native';
import { UserPointAPI } from '../user/apis';
import { attempt } from '../../utils/axios';

export const productsAtom = atom<Product[]>([]);

export const getProductsAtom = atom(null, async (get, set, params: GetProductsParams) => {
    console.log('GetProductsAPI 호출');
    const result = await attempt(() => GetProductsAPI(params));
    if (!result.ok) {
        console.error('상품 정보 가져오기 실패:', result.error);
        return;
    }
    console.log('GetProductsAPI 결과 :', result.value.data);
    set(productsAtom, result.value.data);
});

export const purchaseProductAtom = atom(null, async (get, set, params: PurchaseProductParams) => {
    const result = await attempt(() => PurchaseProductAPI(params));
    if (!result.ok) {
        console.error('상품 구매 실패:', result.error);
        return;
    }

    const response = result.value;
    if (!response) return;

    const { data, status } = response;
    const userData = await get(userAtom);
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
    
    const pointResult = await attempt(() => UserPointAPI({}));
    if (!pointResult.ok) {
        console.error('포인트 정보 가져오기 실패:', pointResult.error);
        return;
    }
    
    const pointResponse = pointResult.value;
    if (!pointResponse || pointResponse.status !== 200) {
        return;
    }
    
    const pointData = pointResponse.data as UserPoint;
    set(userAtom, { ...userData, point: pointData.point, aiPoint: pointData.aiPoint });
});

export const subscriptionAtom = atom<Purchase | null>(null);
export const getSubscriptionAtom = atom(null, async (get, set) => {
    const result = await attempt(() => GetSubscriptionAPI());
    if (!result.ok) {
        console.error('구독 정보 가져오기 실패:', result.error);
        set(subscriptionAtom, null);
        return;
    }
    
    const response = result.value;
    if (response) {
        set(subscriptionAtom, response.data);
    } else {
        set(subscriptionAtom, null);
    }
});

export const subscriptionListAtom = atom<Purchase[] | null>(null);
export const getSubscriptionListAtom = atom(null, async (get, set) => {
    const result = await attempt(() => GetSubscriptionListAPI());
    if (!result.ok) {
        console.error('구독 목록 가져오기 실패:', result.error);
        return;
    }
    
    set(subscriptionListAtom, result.value.data);
});

export const purchaseListAtom = atom<Purchase[] | null>(null);
export const getPurchaseListAtom = atom(null, async (get, set) => {
    const result = await attempt(() => GetPurchaseListAPI());
    if (!result.ok) {
        console.error('구매 목록 가져오기 실패:', result.error);
        return;
    }
    
    set(purchaseListAtom, result.value.data);
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

    const result = await attempt(() => GetPurchaseSubCheckAPI());
    if (!result.ok) {
        console.error('구독 확인 API 호출 중 오류 발생:', result.error);
        return;
    }
    
    set(purchasSubCheckAtom, result.value.data);
});
