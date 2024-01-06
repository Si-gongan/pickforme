import React from 'react';
import { ScrollView, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { userDataAtom } from '../stores/auth/atoms';
import { subscriptionAtom, getProductsAtom, purchaseProductAtom, productsAtom, getSubscriptionAtom } from '../stores/purchase/atoms';
import { Product, ProductType } from '../stores/purchase/types';
import Colors from '../constants/Colors';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import * as WebBrowser from 'expo-web-browser';


import { numComma} from '../utils/common';
import Button, { ButtonText } from '../components/Button';
import { Text, View } from '../components/Themed';
import {
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  ProductPurchase,
  PurchaseError,
  flushFailedPurchasesCachedAsPendingAndroid,
  SubscriptionPurchase,
  requestPurchase,
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
} from 'react-native-iap';

type IAPProduct = Omit<IAPProductB, 'type'>;
type IAPSubscription = Omit<IAPSubscriptionB, 'type' | 'platform'>;

const TERM = `
- 이용방법: 픽은 ‘픽포미 추천’과 ‘픽포미 분석’에서 유료 이용권으로 사용할 수 있습니다. 이용자는 제3자에게 픽을 양도, 대여, 매매할 수 없습니다.
- 이용기간: 픽은 결제일로부터 30일 동안 이용할 수 있습니다.
- 자동결제: 픽포미 멤버십 구독은 매달 만료일에 다음달 이용료가 자동으로 결제됩니다. 구글 플레이 또는 앱스토어에 등록된 계정으로 요금이 부과됩니다.
- 멤버십 해지: 픽포미 멤버십은 언제든지 스토어 구독 정보에서 해지 가능합니다. 해지 시 사용 중인 픽은 만료 시까지 이용 가능하며, 다음 달 구독부터 결제 및 사용이 자동 해지됩니다.
`;

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
    if( products.length) {
      let purchaseUpdateSubscription: any = null;
      let purchaseErrorSubscription: any = null;
      initConnection().then(async () => {
        const storeItems = await IAPGetProducts({ skus: products.filter(p => p.type === ProductType.PURCHASE).map((p) => p.productId) });
        const storeSItems = await IAPGetSubscriptions({ skus: products.filter(p => p.type === ProductType.SUBSCRIPTION).map((p) => p.productId) });
  
        setPurchaseItems(storeItems)
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
                await purchaseProduct({ _id: product._id, receipt: { subscription: isSubscription, ...JSON.parse(receipt) } });
              } else {
                await purchaseProduct({ _id: product._id, receipt });
              }
              await finishTransaction({purchase, isConsumable: !isSubscription });
            },
          );
  
          purchaseErrorSubscription = purchaseErrorListener(
            (error: PurchaseError) => {
              console.error('purchaseErrorListener', error);
            },
          );
        };
        // we make sure that "ghost" pending payment are removed
        // (ghost = failed pending payment that are still marked as pending in Google's native Vending module cache)
        if (Platform.OS === 'android') {
          flushFailedPurchasesCachedAsPendingAndroid().then(addListeners).catch(() => {});
        } else {
          addListeners();
        }
      });
      return () => {
        if (purchaseUpdateSubscription) {
          purchaseUpdateSubscription.remove();
          purchaseUpdateSubscription = null;
        }
    
        if (purchaseErrorSubscription) {
          purchaseErrorSubscription.remove();
          purchaseErrorSubscription = null;
        }
      }
    }
  }, [products]);
  return <PointScreen products={products} purchaseItems={purchaseItems} subscriptionItems={subscriptionItems} />;
}

interface Props {
  products: Product[];
  purchaseItems: IAPProduct[];
  subscriptionItems: IAPSubscription[];
}
const PointScreen: React.FC<Props> = ({ products, purchaseItems, subscriptionItems }) => {
  const router = useRouter();
  const currentSubscription = useAtomValue(subscriptionAtom);
  const userData = useAtomValue(userDataAtom);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);
  const {   connected,
    currentPurchase,
    currentPurchaseError, } = useIAP();


  /*
  const subscriptionProducts = products.filter(({ type }) => type === 'SUBSCRIPTION');
  const purchaseProducts = products.filter(({ type }) => type === 'PURCHASE');
  */

  const handleClickSub = async (sku: string, offerToken?: string) => {
    try {
      if (offerToken) {
      const subscriptionRequest: RequestSubscriptionAndroid = {
        subscriptionOffers: [
          {
            sku,
            offerToken,
          },
        ],
      };

      await requestSubscription(subscriptionRequest);
      } else {
        await requestSubscription({ sku });
      }
    } catch (err: any) {
      console.warn(err.code, err.message);
    }
  }
  const handleClick = async (sku: string) => {
    try {
      await requestPurchase(
        Platform.OS === 'ios' ? { sku } : { skus: [sku] },
      );
    } catch (err: any) {
      console.error(err);
    }
  };

  const filteredProducts = products.reduce((obj, product) => {
    if (product.type === ProductType.PURCHASE) {
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
  }, {
    subscriptionProducts: [] as (IAPSubscription & Product)[],
    purchasableProducts: [] as (IAPProduct & Product)[],
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.myPoint}>
            <Text style={styles.myPointText}>
              내 픽
            </Text>
            <Text style={styles.myPointNumber}>
              {userData?.point}픽
            </Text>
          </View>
          <View style={[styles.myPoint, styles.titleMargin]}>
            <Text style={styles.myPointText}>
              내 멤버십
            </Text>
            <Text style={styles.myPointNumber}>
              {currentSubscription?.product?.displayName || '없음'}
            </Text>
          </View>
          <View style={styles.seperator} />
          <Text style={[styles.myPointText, styles.titleMargin]}>
            픽포미 멤버십
          </Text>
          <Text style={styles.subtitle}>
            매월 편하게 자동 충전할게요!
          </Text>
          {filteredProducts.subscriptionProducts.map(product => {
            const color: 'primary' | 'tertiary' = 'tertiary';
            const buttonTextProps = { color };
            if (product.platform === 'android') {
              const subscriptionOffer = (product as unknown as SubscriptionAndroid).subscriptionOfferDetails.find(subscriptionOfferDetail => subscriptionOfferDetail.basePlanId.replace('-', '_') === product.productId);
              if (!subscriptionOffer) {
                return null;
              }
            return (
              <Button
                key={`Point-Product-${product.productId}`}
                size='medium'
                style={styles.card}
                color={color}
                onPress={() => handleClickSub(product.productId, subscriptionOffer.offerToken)}
              > 
                <ButtonText {...buttonTextProps} textStyle={[styles.productName, styles.productNameMargin]}>
                  {product.displayName}
                </ButtonText>
                <View style={styles.row}>
                  <ButtonText {...buttonTextProps} textStyle={styles.productPoint}>
                    {product.point}픽
                  </ButtonText>
                  <ButtonText {...buttonTextProps} textStyle={styles.productPrice}>
                    월 {subscriptionOffer.pricingPhases.pricingPhaseList[0].formattedPrice}
                  </ButtonText>
                </View>
              </Button>
            );
            }
            return (
                          <Button
                key={`Point-Product-${product.productId}`}
                size='medium'
                style={styles.card}
                color={color}
                onPress={() => handleClickSub(product.productId)}
              >
                <ButtonText {...buttonTextProps} textStyle={[styles.productName, styles.productNameMargin]}>
                  {product.displayName}
                </ButtonText>
                <View style={styles.row}>
                  <ButtonText {...buttonTextProps} textStyle={styles.productPoint}>
                    {product.point}픽
                  </ButtonText>
                  <ButtonText {...buttonTextProps} textStyle={styles.productPrice}>
                    월 {(product as any).localizedPrice}
                  </ButtonText>
                </View>
              </Button>
            );
          })}
          <Text style={[styles.myPointText, styles.titleMargin]}>
            픽포미 1회권
          </Text>
          <Text style={[styles.subtitle]}>
            필요할 때마다 구매할게요!
          </Text>
          {filteredProducts.purchasableProducts.map(product => {
            const color: 'primary' | 'tertiary' = 'tertiary';
            const buttonTextProps = { color };
            return (
              <Button
                key={`Point-Product-${product.productId}`}
                size='medium'
                style={styles.card}
                color={color}
                onPress={() => handleClick(product.productId)}
              > 
                <View style={styles.row}>
                  <ButtonText {...buttonTextProps} textStyle={styles.productName}>
                    {product.displayName}
                  </ButtonText>
                  <ButtonText {...buttonTextProps} textStyle={styles.productPrice}>
                    {product.localizedPrice}
                  </ButtonText>
                </View>
              </Button>
            );
          })}
          <Button
            title='픽 이용약관'
            variant='text'
            onPress={() => WebBrowser.openBrowserAsync('https://sites.google.com/view/sigongan-useterm/홈')}
            color='tertiary'
            size='small'
          />
          <Text style={styles.terms}>
            {TERM}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 31,
  },
  seperator: {
    height: 1,
    width: '100%',
    marginTop: 20,
    marginBottom: 3,
    backgroundColor: Colors[colorScheme].borderColor.primary,
  },
  titleMargin: {
    marginTop: 24,
  },
  subtitle: {
    marginTop: 9,
    marginBottom: 15,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,
  },
  myPoint: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myPointText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  myPointNumber: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 27,
  },
  row: {
    alignSelf: 'center',
    justifySelf: 'center',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  card: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 17,
    paddingVertical: 13,
    borderRadius: 10,
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  productNameMargin: {
    marginBottom: 9,
  },
  productPoint: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 19,
  },
  productPrice: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 22,
  },
  terms: {
    marginTop: 12,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
  },
  buttonWrap: {
    width: '100%',
    padding: 31,
  },
});
export default withIAPContext(PurchaseWrapper);
