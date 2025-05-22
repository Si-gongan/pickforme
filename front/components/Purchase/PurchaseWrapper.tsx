import { useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
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
    withIAPContext
} from 'react-native-iap';

import { getProductsAtom, getSubscriptionAtom, productsAtom, purchaseProductAtom } from '../../stores/purchase/atoms';
import { Product, ProductType } from '../../stores/purchase/types';

type IAPProduct = Omit<IAPProductB, 'type'>;
type IAPSubscription = Omit<IAPSubscriptionB, 'type' | 'platform'>;

interface PurchaseWrapperProps {
    children: (props: {
        products: Product[];
        purchaseItems: IAPProduct[];
        subscriptionItems: IAPSubscription[];
    }) => React.ReactNode;
}

const PurchaseWrapper: React.FC<PurchaseWrapperProps> = ({ children }) => {
    const purchaseProduct = useSetAtom(purchaseProductAtom);
    const [purchaseItems, setPurchaseItems] = useState<IAPProduct[]>([]);
    const [subscriptionItems, setSubscriptionItems] = useState<IAPSubscription[]>([]);
    const getProducts = useSetAtom(getProductsAtom);
    const getSubscription = useSetAtom(getSubscriptionAtom);
    const products = useAtomValue(productsAtom);

    const purchaseUpdateRef = useRef<any>(null);
    const purchaseErrorRef = useRef<any>(null);
    const hasListenerInitializedRef = useRef(false);

    useEffect(() => {
        getProducts({ platform: Platform.OS });
    }, [getProducts]);

    useEffect(() => {
        getSubscription();
    }, [getSubscription]);

    useEffect(() => {
        if (!products.length) return;

        const initializeIAP = async () => {
            if (hasListenerInitializedRef.current) return;
            hasListenerInitializedRef.current = true;

            await initConnection();

            const subscriptionItemLists = products
                .filter(p => p.type === ProductType.SUBSCRIPTION)
                .map(p => p.productId);

            const storeSItems = await IAPGetSubscriptions({ skus: subscriptionItemLists });
            setSubscriptionItems(storeSItems);

            const addListeners = () => {
                console.log('✅ listener 등록됨');

                purchaseUpdateRef.current = purchaseUpdatedListener(async purchase => {
                    const receipt = purchase.transactionReceipt;
                    const product = products.find(({ productId }) => productId === purchase.productId);
                    if (!product || !receipt) return;

                    const isSubscription = product.type === ProductType.SUBSCRIPTION;
                    const parsedReceipt =
                        Platform.OS === 'android' ? { subscription: isSubscription, ...JSON.parse(receipt) } : receipt;

                    await purchaseProduct({ _id: product._id, receipt: parsedReceipt });
                    await finishTransaction({ purchase, isConsumable: !isSubscription });
                });

                purchaseErrorRef.current = purchaseErrorListener((error: PurchaseError) => {
                    console.error('purchaseErrorListener', error);
                });
            };

            if (Platform.OS === 'android') {
                await flushFailedPurchasesCachedAsPendingAndroid().catch(() => {});
            }

            addListeners();
        };

        initializeIAP();

        return () => {
            console.log('🧹 IAP listener 정리');

            purchaseUpdateRef.current?.remove?.();
            purchaseErrorRef.current?.remove?.();

            purchaseUpdateRef.current = null;
            purchaseErrorRef.current = null;
            hasListenerInitializedRef.current = false;
        };
    }, [products, purchaseProduct]);

    return <>{children({ products, purchaseItems, subscriptionItems })}</>;
};

export default withIAPContext(PurchaseWrapper);
