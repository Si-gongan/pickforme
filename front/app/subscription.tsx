import React from 'react';
import { ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import Markdown from 'react-native-markdown-display';
import {
    initConnection,
    purchaseErrorListener,
    purchaseUpdatedListener,
    ProductPurchase,
    PurchaseError,
    flushFailedPurchasesCachedAsPendingAndroid,
    SubscriptionPurchase,
    requestSubscription,
    getProducts as IAPGetProducts,
    getSubscriptions as IAPGetSubscriptions,
    Product as IAPProductB,
    Subscription as IAPSubscriptionB,
    SubscriptionAndroid,
    finishTransaction,
    useIAP,
    withIAPContext,
    RequestSubscriptionAndroid,
    clearProductsIOS,
    getReceiptIOS,
    getAvailablePurchases,
    clearTransactionIOS
} from 'react-native-iap';

import {
    subscriptionAtom,
    getProductsAtom,
    purchaseProductAtom,
    productsAtom,
    getSubscriptionAtom
} from '../stores/purchase/atoms';
import { Product, ProductType } from '../stores/purchase/types';
import { userDataAtom, isShowSubscriptionModalAtom } from '@stores';
import { Colors } from '@constants';
import useColorScheme from '../hooks/useColorScheme';
import { Text, View, Button_old as Button, BackHeader } from '@components';
import { initializeIAP } from '../services/IAPservice';

// 2024
import { GetPurchaseSubCheckAPI } from '../stores/purchase/apis';

import type { ColorScheme } from '@hooks';

type IAPProduct = Omit<IAPProductB, 'type'>;
type IAPSubscription = Omit<IAPSubscriptionB, 'type' | 'platform'>;

const TERM = `
- 이용방법: 픽은 ‘픽포미 추천’과 ‘픽포미 분석’에서 유료 이용권으로 사용할 수 있습니다. 이용자는 제3자에게 픽을 양도, 대여, 매매할 수 없습니다.
- 이용기간: 픽은 결제일로부터 30일 동안 이용할 수 있습니다.
- 자동결제: 픽포미 멤버십 구독은 매달 만료일에 다음달 이용료가 자동으로 결제됩니다. 구글 플레이 또는 앱스토어에 등록된 계정으로 요금이 부과됩니다.
- 멤버십 해지: 픽포미 멤버십은 언제든지 스토어 구독 정보에서 해지 가능합니다. 해지 시 사용 중인 픽은 만료 시까지 이용 가능하며, 다음달 구독부터 결제 및 사용이 자동 해지됩니다.
`;

const checkSubscriptionStatus = async () => {
    try {
        const purchaseHistory = await getAvailablePurchases();
        purchaseHistory.forEach(purchase => {
            if (purchase.productId === 'pickforme_basic') {
                // 구독이 유효한지 확인 후 처리
                console.log('구독 활성화 상태');
            }
        });
    } catch (error) {
        console.warn(error);
    }
};

const PurchaseWrapper = () => {
    const purchaseProduct = useSetAtom(purchaseProductAtom);
    const [purchaseItems, setPurchaseItems] = useState<IAPProduct[]>([]);
    const [subscriptionItems, setSubscriptionItems] = useState<IAPSubscription[]>([]);
    const getProducts = useSetAtom(getProductsAtom);
    const getSubscription = useSetAtom(getSubscriptionAtom);
    const products = useAtomValue(productsAtom);

    useEffect(() => {
        getProducts({ platform: Platform.OS });
    }, [getProducts]);

    useEffect(() => {
        getSubscription();
    }, [getSubscription]);

    useEffect(() => {
        if (products.length) {
            let purchaseUpdateSubscription: any = null;
            let purchaseErrorSubscription: any = null;

            const initializeIAP = async () => {
                await initConnection();

                // initConnection().then(async () => {
                // const storeItems = await IAPGetProducts({ skus: products.filter(p => p.type === ProductType.PURCHASE).map((p) => p.productId) }); // 단건

                const storeSItems = await IAPGetSubscriptions({
                    skus: products.filter(p => p.type === ProductType.SUBSCRIPTION).map(p => p.productId)
                });

                // setPurchaseItems(storeItems)
                setSubscriptionItems(storeSItems);

                const addListeners = () => {
                    purchaseUpdateSubscription = purchaseUpdatedListener(
                        async (purchase: SubscriptionPurchase | ProductPurchase) => {
                            const receipt = purchase.transactionReceipt;

                            const product = products.find(({ productId }) => productId === purchase.productId);
                            if (!product) {
                                return;
                            }
                            const isSubscription = product.type === ProductType.SUBSCRIPTION;
                            if (!receipt) {
                                return;
                            }
                            if (Platform.OS === 'android') {
                                await purchaseProduct({
                                    _id: product._id,
                                    receipt: { subscription: isSubscription, ...JSON.parse(receipt) }
                                });
                            } else {
                                await purchaseProduct({ _id: product._id, receipt });
                            }
                            await finishTransaction({ purchase, isConsumable: !isSubscription });
                        }
                    );

                    purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
                        console.error('purchaseErrorListener', error);
                    });
                };
                // we make sure that "ghost" pending payment are removed
                // (ghost = failed pending payment that are still marked as pending in Google's native Vending module cache)
                if (Platform.OS === 'android') {
                    flushFailedPurchasesCachedAsPendingAndroid()
                        .then(addListeners)
                        .catch(() => {});
                } else {
                    addListeners();
                }
            };

            initializeIAP();
            return () => {
                if (purchaseUpdateSubscription) {
                    purchaseUpdateSubscription.remove();
                    purchaseUpdateSubscription = null;
                }

                if (purchaseErrorSubscription) {
                    purchaseErrorSubscription.remove();
                    purchaseErrorSubscription = null;
                }
            };
        }
    }, [products]);

    return <PointScreen products={products} purchaseItems={purchaseItems} subscriptionItems={subscriptionItems} />;
};

interface Props {
    products: Product[];
    purchaseItems: IAPProduct[];
    subscriptionItems: IAPSubscription[];
}
export const PointScreen: React.FC<Props> = ({ products, purchaseItems, subscriptionItems }) => {
    const router = useRouter();
    const currentSubscription = useAtomValue(subscriptionAtom);
    const userData = useAtomValue(userDataAtom);
    const colorScheme = useColorScheme();
    const styles = useStyles(colorScheme);
    const { connected, currentPurchase, currentPurchaseError } = useIAP();
    const markdownStyles = StyleSheet.create({
        text: {
            fontSize: 14,
            lineHeight: 20,
            color: Colors[colorScheme].text.primary
        }
    });

    const [isSubscription, setIsSubscription] = useState<boolean>(false);
    const setIsShowSubscriptionModalAtomModal = useSetAtom(isShowSubscriptionModalAtom);

    useEffect(() => {
        if (isSubscription) {
            setIsShowSubscriptionModalAtomModal(true);
        }
    }, [isSubscription]);

    const handleClickSub = async (sku: string, offerToken?: string | null) => {
        try {
            const subCheck = await GetPurchaseSubCheckAPI();
            if (subCheck.data.activate) {
                Alert.alert('이미 구독중입니다.');
                return;
            }

            checkSubscriptionStatus;
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
                setIsSubscription(true); // 구독 완료 바텀시트
            } else {
                // ios
                await clearTransactionIOS();

                const request = await requestSubscription({
                    sku,
                    andDangerouslyFinishTransactionAutomaticallyIOS: false
                });
                if (request) {
                    // Alert.alert('구독 성공', JSON.stringify(request));
                } else {
                    // Alert.alert('구독 실패', '구독에 실패하였습니다.');
                }
                setIsSubscription(true); // 구독 완료 바텀시트
            }
        } catch (err: any) {
            console.log('error!');
            console.warn(err.code, err.message);
        }
    };

    const filteredProducts = products.reduce(
        (obj, product) => {
            console.log('filteredProducts product : ', product);
            if (product.type === ProductType.PURCHASE) {
                // 단건 로직
                const item = purchaseItems.find(({ productId }) => product.productId === productId);
                if (item) {
                    obj.purchasableProducts.push({ ...item, ...product });
                }
            } else {
                const item = subscriptionItems.find(({ productId }) => product.productId === productId);
                if (item) {
                    obj.subscriptionProducts.push({ ...item, ...product });
                }
            }
            return obj;
        },
        {
            subscriptionProducts: [] as (IAPSubscription & Product)[],
            purchasableProducts: [] as (IAPProduct & Product)[]
        }
    );
    console.log('filteredProducts : ', filteredProducts);
    return (
        <View style={styles.container}>
            <BackHeader />
            <ScrollView>
                <View style={styles.content}>
                    <View style={styles.description}>
                        <Text style={styles.title}>픽포미 플러스</Text>
                        <Text style={styles.subtitle}>한 달 AI 질문 무제한, 매니저 질문 30회 이용권</Text>
                        <Text>픽포미 멤버십을 구독하고, 자유롭게 질문해 보세요.</Text>
                        <Text>멤버십은 결제일로부터 한 달이 지나면 자동해지됩니다.</Text>
                    </View>

                    {filteredProducts.subscriptionProducts.map(product => {
                        console.log('product : ', product);
                        if (product.platform === 'android') {
                            const subscriptionOffer = (product as unknown as SubscriptionAndroid)
                                .subscriptionOfferDetails[0];

                            return (
                                <View key={`Point-Product-${product.productId}`} style={styles.productWrap}>
                                    <Text style={styles.productPrice}>
                                        월{' '}
                                        {subscriptionOffer.pricingPhases.pricingPhaseList[0].formattedPrice.replace(
                                            /₩(.*)/,
                                            '$1원'
                                        )}
                                    </Text>
                                    <Button
                                        style={styles.productButton}
                                        title="멤버십 시작하기"
                                        size="small"
                                        onPress={() => handleClickSub(product.productId, subscriptionOffer.offerToken)}
                                    />
                                </View>
                            );
                        }

                        console.log('멤버십 product : ', product);
                        console.log('product.platform:', product?.platform);

                        return (
                            <View key={`Point-Product-${product.productId}`} style={styles.productWrap}>
                                <Text style={styles.productPrice}>
                                    월 {(product as any).localizedPrice.replace(/₩(.*)/, '$1원')}
                                </Text>
                                <Button
                                    style={styles.productButton}
                                    title="멤버십 시작하기"
                                    size="small"
                                    onPress={() => handleClickSub(product.productId, null)}
                                />
                            </View>
                        );
                    })}
                    <Text style={styles.subtitle}>멤버십 혜택 자세히</Text>
                    <Markdown style={markdownStyles}>
                        {
                            '**혜택 1:** AI 질문하기 매월 무제한 이용 가능 \n**혜택 2:** 매니저 질문하기 전 상품 최대 1회씩 이용 가능'
                        }
                    </Markdown>
                </View>
                {/* <View style={styles.content}>
          <Button
            style={styles.termButton}
            title="픽 이용약관"
            variant="text"
            onPress={() =>
              WebBrowser.openBrowserAsync(
                "https://sites.google.com/view/sigongan-useterm/홈"
              )
            }
            color="tertiary"
            size="small"
          />
          <Text style={styles.terms}>{TERM}</Text>
        </View> */}
            </ScrollView>
        </View>
    );
};

const useStyles = (colorScheme: ColorScheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 30
        },
        content: {
            flex: 1,
            padding: 31
        },
        title: {
            fontWeight: '600',
            fontSize: 20,
            lineHeight: 24,
            marginBottom: 18
        },
        subtitle: {
            fontWeight: '600',
            fontSize: 14,
            lineHeight: 17,
            marginBottom: 14
        },
        description: {
            marginBottom: 16
        },
        productWrap: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: 14,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor.secondary,
            marginVertical: 24
        },
        productButton: {
            width: 120,
            padding: 10,
            backgroundColor: Colors[colorScheme].button.primary.background
        },
        productPrice: {
            fontWeight: '600',
            fontSize: 18,
            lineHeight: 22
        },
        terms: {
            marginTop: 12,
            fontWeight: '400',
            fontSize: 12,
            lineHeight: 15
        },
        buttonText: {
            fontWeight: '600',
            fontSize: 14,
            lineHeight: 17,
            color: 'white'
        },
        termButton: {
            marginTop: 100
        }
    });
export default withIAPContext(PurchaseWrapper);
