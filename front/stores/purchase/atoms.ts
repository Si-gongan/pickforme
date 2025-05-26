import { atom } from 'jotai';
import {
    GetProductsParams,
    PurchaseProductParams,
    Product,
    Purchase,
    PurchaseSubCheck,
    GetSubscriptionResponse
} from './types';
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
import axios from 'axios';

export const productsAtom = atom<Product[]>([]);

export const getProductsAtom = atom(null, async (get, set, params: GetProductsParams) => {
    // console.log('GetProductsAPI 호출');
    const result = await attempt(() => GetProductsAPI(params));
    if (!result.ok) {
        console.error('상품 정보 가져오기 실패:', result.error);
        return;
    }
    // console.log('GetProductsAPI 결과 :', result.value.data);
    set(productsAtom, result.value.data);
});

export const purchaseProductAtom = atom(null, async (get, set, params: PurchaseProductParams) => {
    try {
        const result = await PurchaseProductAPI(params);
        const { data, status } = result;

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

        try {
            const pointResult = await UserPointAPI({});
            const pointResponse = pointResult;

            if (!pointResponse || pointResponse.status !== 200) {
                return;
            }

            const pointData = pointResponse.data as UserPoint;
            set(userAtom, { ...userData, point: pointData.point, aiPoint: pointData.aiPoint });
        } catch (pointError) {
            console.error('포인트 정보 가져오기 실패:', pointError);
            return;
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                // 서버가 응답을 반환한 경우
                console.error('상품 구매 실패:', error.response.data);
                Alert.alert(
                    '구매 처리 중 오류가 발생했습니다.',
                    error.response.data.message || '잠시 후 다시 시도해주세요.'
                );
            } else if (error.request) {
                // 요청은 보냈지만 응답을 받지 못한 경우
                console.error('상품 구매 실패: 서버 응답 없음');
                Alert.alert('구매 처리 중 오류가 발생했습니다.', '서버와의 통신이 원활하지 않습니다.');
            } else {
                // 요청 설정 중 오류가 발생한 경우
                console.error('상품 구매 실패:', error.message);
                Alert.alert('구매 처리 중 오류가 발생했습니다.', '잠시 후 다시 시도해주세요.');
            }
        } else {
            // Axios 에러가 아닌 경우
            console.error('상품 구매 실패:', error);
            Alert.alert('구매 처리 중 오류가 발생했습니다.', '잠시 후 다시 시도해주세요.');
        }
        return;
    }
});

export const subscriptionAtom = atom<GetSubscriptionResponse | null>(null);
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
