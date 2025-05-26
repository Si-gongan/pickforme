import { useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import {
    Product as IAPProductB,
    Subscription as IAPSubscriptionB,
    RequestSubscriptionAndroid,
    SubscriptionAndroid,
    clearTransactionIOS,
    requestSubscription
} from 'react-native-iap';
import Markdown from 'react-native-markdown-display';

import { BackHeader, Button_old as Button, Text, View } from '@components';
import { Colors } from '@constants';
import { isShowSubscriptionModalAtom } from '@stores';
import useColorScheme from '../hooks/useColorScheme';
import { Product, ProductType } from '../stores/purchase/types';

// 2024
import { GetSubscriptionAPI } from '../stores/purchase/apis';

import type { ColorScheme } from '@hooks';
import PurchaseWrapper from '../components/Purchase/PurchaseWrapper';

type IAPProduct = Omit<IAPProductB, 'type'>;
type IAPSubscription = Omit<IAPSubscriptionB, 'type' | 'platform'>;

interface Props {
    products: Product[];
    purchaseItems: IAPProduct[];
    subscriptionItems: IAPSubscription[];
}

const SubscriptionScreen = () => {
    return (
        <PurchaseWrapper>
            {({ products, purchaseItems, subscriptionItems }) => (
                <PointScreen products={products} purchaseItems={purchaseItems} subscriptionItems={subscriptionItems} />
            )}
        </PurchaseWrapper>
    );
};

export const PointScreen: React.FC<Props> = ({ products, purchaseItems, subscriptionItems }) => {
    const colorScheme = useColorScheme();
    const styles = useStyles(colorScheme);
    const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(false);
    const markdownStyles = StyleSheet.create({
        text: {
            fontSize: 14,
            lineHeight: 20,
            color: Colors[colorScheme].text.primary
        }
    });

    const [isSubscription, setIsSubscription] = useState<boolean>(false);
    const setIsShowSubscriptionModalAtomModal = useSetAtom(isShowSubscriptionModalAtom);
    const [filteredProducts, setFilteredProducts] = useState<{
        subscriptionProducts: (IAPSubscription & Product)[];
        purchasableProducts: (IAPProduct & Product)[];
    }>({
        subscriptionProducts: [],
        purchasableProducts: []
    });

    useEffect(() => {
        if (isSubscription) {
            setIsShowSubscriptionModalAtomModal(true);
        }
    }, [isSubscription]);

    const handleClickSub = async (sku: string, offerToken?: string | null) => {
        try {
            if (subscriptionLoading) {
                return;
            }

            setSubscriptionLoading(true);

            const subCheck = await GetSubscriptionAPI();
            const { activate } = subCheck.data;

            if (activate) {
                Alert.alert('이미 픽포미 플러스를 구독중이에요!');
                return;
            }

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
                setIsSubscription(true);
            } else {
                // ios
                await clearTransactionIOS();
                await requestSubscription({
                    sku,
                    andDangerouslyFinishTransactionAutomaticallyIOS: false
                });
                setIsSubscription(true);
            }
        } catch (error) {
            console.error('구독 처리 중 에러 발생:', error);
            Alert.alert('구독 처리 중 오류가 발생했습니다.');
            // 필요한 경우 에러 상태 처리
            setIsSubscription(false);
        } finally {
            setSubscriptionLoading(false);
        }
    };

    const getFilteredProducts = () => {
        let filteredTmp = products.reduce(
            (obj, product) => {
                // console.log('filteredProducts product : ', product);
                if (product.type === ProductType.PURCHASE) {
                    // 단건 로직
                    const item = purchaseItems.find(({ productId }) => {
                        // console.log('productId in purchaseItems', productId, product.productId);
                        return product.productId === productId;
                    });
                    if (item) {
                        // console.log('purchaseItems item found:', item);
                        obj.purchasableProducts.push({ ...item, ...product });
                    }
                } else {
                    // console.log('subscriptionItems type:', typeof subscriptionItems[0], subscriptionItems);

                    // subscriptionItems가 문자열 배열인 경우
                    if (
                        Array.isArray(subscriptionItems) &&
                        subscriptionItems.length > 0 &&
                        typeof subscriptionItems[0] === 'string'
                    ) {
                        const stringItems = subscriptionItems as unknown as string[];
                        if (stringItems.includes(product.productId)) {
                            // console.log('String array match found for:', product.productId);
                            // 문자열 배열에서 일치하는 항목 찾음
                            const dummyItem = {
                                productId: product.productId,
                                title: product.displayName || '',
                                description: ''
                            };
                            obj.subscriptionProducts.push({ ...dummyItem, ...product });
                        }
                    } else {
                        // 객체 배열인 경우 (원래 코드)
                        const item = subscriptionItems.find(({ productId }) => {
                            // console.log('productId in subscriptionItems', productId, product.productId);
                            return product.productId === productId;
                        });
                        if (item) {
                            // console.log('subscriptionItems item found:', item);
                            obj.subscriptionProducts.push({ ...item, ...product });
                        }
                    }
                }
                return obj;
            },
            {
                subscriptionProducts: [] as (IAPSubscription & Product)[],
                purchasableProducts: [] as (IAPProduct & Product)[]
            }
        );
        // console.log('filteredTmp : ', filteredTmp);
        setFilteredProducts(filteredTmp);
    };

    useEffect(() => {
        // console.log('products가 들어왔음', products);

        getFilteredProducts();
    }, [products, purchaseItems, subscriptionItems]);

    return (
        <View style={styles.container}>
            <BackHeader />
            <ScrollView style={{ backgroundColor: Colors[colorScheme].background.primary }}>
                <View style={styles.content}>
                    <View style={styles.description}>
                        <Text style={styles.title}>픽포미 플러스</Text>
                        <Text style={styles.subtitle}>한 달 AI 질문 무제한, 매니저 질문 30회 이용권</Text>
                        <Text style={{ color: Colors[colorScheme].text.primary }}>
                            픽포미 멤버십을 구독하고, 자유롭게 질문해 보세요.
                        </Text>
                        <Text style={{ color: Colors[colorScheme].text.primary }}>
                            멤버십은 결제일로부터 한 달이 지나면 자동해지됩니다.
                        </Text>
                    </View>

                    {filteredProducts.subscriptionProducts.map(product => {
                        // console.log('product : ', product);
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
                                        style={[styles.productButton]}
                                        textStyle={{ color: Colors[colorScheme].text.secondary }}
                                        title="멤버십 시작하기"
                                        size="small"
                                        onPress={() => handleClickSub(product.productId, subscriptionOffer.offerToken)}
                                    />
                                </View>
                            );
                        }

                        // console.log('멤버십 product : ', product);
                        // console.log('product.platform:', product?.platform);

                        return (
                            <View key={`Point-Product-${product.productId}`} style={styles.productWrap}>
                                <Text style={styles.productPrice}>
                                    월 {(product as any).localizedPrice.replace(/₩(.*)/, '$1원')}
                                </Text>
                                <Button
                                    style={[styles.productButton]}
                                    textStyle={{ color: Colors[colorScheme].text.secondary }}
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
                            '**혜택 1:** AI 질문하기 매월 무제한 이용 가능 \n**혜택 2:** 매니저 질문하기 매월 30회 이용 가능'
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
            paddingTop: 30,
            backgroundColor: Colors[colorScheme].background.primary
        },
        content: {
            flex: 1,
            padding: 31
        },
        title: {
            fontWeight: '600',
            fontSize: 20,
            lineHeight: 24,
            marginBottom: 18,
            color: Colors[colorScheme].text.primary
        },
        subtitle: {
            fontWeight: '600',
            fontSize: 14,
            lineHeight: 17,
            marginBottom: 14,
            color: Colors[colorScheme].text.primary
        },
        description: {
            marginBottom: 16,
            color: Colors[colorScheme].text.primary
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
            marginVertical: 24,
            backgroundColor: Colors[colorScheme].background.secondary
        },
        productButton: {
            width: 120,
            padding: 10,
            backgroundColor: Colors[colorScheme].button.primary.background
        },
        productPrice: {
            fontWeight: '600',
            fontSize: 18,
            lineHeight: 22,
            color: Colors[colorScheme].text.primary
        },
        terms: {
            marginTop: 12,
            fontWeight: '400',
            fontSize: 12,
            lineHeight: 15,
            color: Colors[colorScheme].text.primary
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

export default SubscriptionScreen;
