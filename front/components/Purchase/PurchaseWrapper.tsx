import { useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, ActivityIndicator, View, StyleSheet, AccessibilityInfo } from 'react-native';
import {
    getSubscriptions as IAPGetSubscriptions,
    Product as IAPProductB,
    Subscription as IAPSubscriptionB,
    PurchaseError,
    finishTransaction,
    flushFailedPurchasesCachedAsPendingAndroid,
    initConnection,
    purchaseErrorListener,
    purchaseUpdatedListener,
    withIAPContext,
    RequestSubscriptionAndroid,
    SubscriptionAndroid,
    requestSubscription
} from 'react-native-iap';

import { getProductsAtom, getSubscriptionAtom, productsAtom, purchaseProductAtom } from '@/stores/purchase/atoms';
import { GetSubscriptionAPI, CheckPurchaseFailureAPI } from '@/stores/purchase/apis';
import { Product, ProductType } from '@/stores/purchase/types';
import { isShowSubscriptionModalAtom } from '@/stores/auth';
import { Colors } from '@constants';
import useColorScheme from '@/hooks/useColorScheme';

type IAPProduct = Omit<IAPProductB, 'type'>;
type IAPSubscription = Omit<IAPSubscriptionB, 'type' | 'platform'>;

interface PurchaseWrapperProps {
    children: (props: {
        products: Product[];
        purchaseItems: IAPProduct[];
        subscriptionItems: IAPSubscription[];
        handleSubscription: (sku: string, offerToken?: string | null) => Promise<boolean>;
        subscriptionLoading: boolean;
    }) => React.ReactNode;
}

const PurchaseWrapper: React.FC<PurchaseWrapperProps> = ({ children }) => {
    const purchaseProduct = useSetAtom(purchaseProductAtom);
    const setIsShowSubscriptionModal = useSetAtom(isShowSubscriptionModalAtom);
    const [purchaseItems] = useState<IAPProduct[]>([]);
    const [subscriptionItems, setSubscriptionItems] = useState<IAPSubscription[]>([]);
    const getProducts = useSetAtom(getProductsAtom);
    const getSubscription = useSetAtom(getSubscriptionAtom);
    const products = useAtomValue(productsAtom);
    const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(false);

    const purchaseUpdateRef = useRef<any>(null);
    const purchaseErrorRef = useRef<any>(null);
    const isInitializingRef = useRef(false);
    const loadingViewRef = useRef<View>(null);
    const colorScheme = useColorScheme();

    useEffect(() => {
        getProducts({ platform: Platform.OS });
    }, [getProducts]);

    useEffect(() => {
        getSubscription();
    }, [getSubscription]);

    const handleSubscription = async (sku: string, offerToken?: string | null) => {
        try {
            if (subscriptionLoading) {
                Alert.alert('구독 처리가 진행 중입니다. 잠시만 기다려주세요.');
                return false;
            }

            setSubscriptionLoading(true);

            const subCheck = await GetSubscriptionAPI();
            const { activate } = subCheck.data;

            if (activate) {
                Alert.alert('이미 픽포미 플러스를 구독중이에요!');
                setSubscriptionLoading(false);
                return false;
            }

            const failureCheck = await CheckPurchaseFailureAPI();
            if (!failureCheck.data.canPurchase) {
                Alert.alert('구독 불가', '이전 구독 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요.');
                setSubscriptionLoading(false);
                return false;
            }

            // 만약에 구독 핸들러가 제대로 등록되지 않았다면 결제 못하도록 처리
            if (!purchaseUpdateRef.current || !purchaseErrorRef.current) {
                Alert.alert('구독 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                setSubscriptionLoading(false);
                return;
            }

            console.log('구독 요청중..');

            if (offerToken) {
                const subscriptionRequest: RequestSubscriptionAndroid = {
                    subscriptionOffers: [
                        {
                            sku,
                            offerToken
                        }
                    ]
                };
                await requestSubscription(subscriptionRequest);
            } else {
                await requestSubscription({ sku });
            }
            return true;
        } catch (error) {
            console.error('구독 처리 중 에러 발생:', error);
            Alert.alert('구독 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            setSubscriptionLoading(false);
            return false;
        }
    };

    useEffect(() => {
        if (!products.length || isInitializingRef.current) return;

        const initializeIAP = async () => {
            try {
                isInitializingRef.current = true;

                await initConnection();

                const subscriptionItemLists = products
                    .filter(p => p.type === ProductType.SUBSCRIPTION)
                    .map(p => p.productId);

                const storeSItems = await IAPGetSubscriptions({ skus: subscriptionItemLists });
                setSubscriptionItems(storeSItems);

                const addListeners = () => {
                    if (purchaseUpdateRef.current) {
                        purchaseUpdateRef.current.remove();
                    }
                    if (purchaseErrorRef.current) {
                        purchaseErrorRef.current.remove();
                    }

                    purchaseUpdateRef.current = purchaseUpdatedListener(async purchase => {
                        let isSubscription = false;

                        try {
                            const receipt = purchase.transactionReceipt;
                            const product = products.find(({ productId }) => productId === purchase.productId);
                            if (!product || !receipt) return;

                            isSubscription = product.type === ProductType.SUBSCRIPTION;

                            const parsedReceipt =
                                Platform.OS === 'android'
                                    ? { subscription: isSubscription, ...JSON.parse(receipt) }
                                    : receipt;

                            await purchaseProduct({ _id: product._id, receipt: parsedReceipt });
                            await getSubscription();

                            setIsShowSubscriptionModal(true);
                        } catch (error) {
                            console.error('구매 처리 중 에러 발생:', error);
                            Alert.alert('구독 완료 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.');
                        } finally {
                            setSubscriptionLoading(false);

                            // 결제가 실패하든 일단 결제 자체는 종료함.
                            await finishTransaction({ purchase, isConsumable: !isSubscription });
                        }
                    });

                    purchaseErrorRef.current = purchaseErrorListener((error: PurchaseError) => {
                        if (error.code !== 'E_USER_CANCELLED') {
                            console.error('구독 처리 중 에러 발생:', error);
                            Alert.alert('구독 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.');
                        }
                        setSubscriptionLoading(false);
                    });
                };

                if (Platform.OS === 'android') {
                    await flushFailedPurchasesCachedAsPendingAndroid().catch(() => {});
                }

                addListeners();
            } catch (error) {
                console.error('initializeIAP error', error);
            }
        };

        initializeIAP();
    }, [products, purchaseProduct, setIsShowSubscriptionModal]);

    useEffect(() => {
        return () => {
            isInitializingRef.current = false;

            if (purchaseUpdateRef.current) {
                purchaseUpdateRef.current.remove();
                purchaseUpdateRef.current = null;
            }

            if (purchaseErrorRef.current) {
                purchaseErrorRef.current.remove();
                purchaseErrorRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (subscriptionLoading) {
            setTimeout(() => {
                loadingViewRef.current?.setNativeProps({
                    accessibilityViewIsModal: true
                });
                AccessibilityInfo.announceForAccessibility('구독 처리가 진행 중입니다. 잠시만 기다려주세요.');
            }, 100);
        }
    }, [subscriptionLoading]);

    return (
        <>
            {children({ products, purchaseItems, subscriptionItems, handleSubscription, subscriptionLoading })}
            {subscriptionLoading && (
                <View
                    ref={loadingViewRef}
                    style={[styles.loadingOverlay, { backgroundColor: `${Colors[colorScheme].background.primary}CC` }]}
                    accessible={true}
                    accessibilityLabel="구독 처리 중"
                    accessibilityHint="구독 처리가 진행 중입니다. 잠시만 기다려주세요."
                    accessibilityRole="alert"
                    importantForAccessibility="yes"
                >
                    <ActivityIndicator size="large" color={Colors[colorScheme].text.primary} />
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
    }
});

export default withIAPContext(PurchaseWrapper);
