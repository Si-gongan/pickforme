import React from 'react';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { getProductsAtom, purchaseProductAtom, productsAtom, getSubscriptionAtom } from '../stores/purchase/atoms';
import { Product, ProductType } from '../stores/purchase/types';
import Colors from '../constants/Colors';
import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
import * as WebBrowser from 'expo-web-browser';

import Button from '../components/Button';
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
  getProducts as IAPGetProducts,
  getSubscriptions as IAPGetSubscriptions,
  Product as IAPProductB,
  Subscription as IAPSubscriptionB,
  finishTransaction,
  withIAPContext,
} from 'react-native-iap';

type IAPProduct = Omit<IAPProductB, 'type'>;
type IAPSubscription = Omit<IAPSubscriptionB, 'type' | 'platform'>;

const TERM = `
- 이용방법: 픽은 ‘픽포미 추천’과 ‘픽포미 분석’에서 유료 이용권으로 사용할 수 있습니다. 이용자는 제3자에게 픽을 양도, 대여, 매매할 수 없습니다.
- 이용기간: 픽은 결제일로부터 30일 동안 이용할 수 있습니다.
- 자동결제: 픽포미 멤버십 구독은 매달 만료일에 다음달 이용료가 자동으로 결제됩니다. 구글 플레이 또는 앱스토어에 등록된 계정으로 요금이 부과됩니다.
- 멤버십 해지: 픽포미 멤버십은 언제든지 스토어 구독 정보에서 해지 가능합니다. 해지 시 사용 중인 픽은 만료 시까지 이용 가능하며, 다음달 구독부터 결제 및 사용이 자동 해지됩니다.
`;

const PurchaseWrapper: React.FC = () => {
  const purchaseProduct = useSetAtom(purchaseProductAtom);
  const [purchaseItems, setPurchaseItems] = useState<IAPProduct[]>([]);
  const [subscriptionItems, setSubscriptionItems] = useState<IAPSubscription[]>([]);
  const getProducts = useSetAtom(getProductsAtom);
  const getSubscription = useSetAtom(getSubscriptionAtom);
  const products = useAtomValue(productsAtom);
  const processedTransactions = useRef(new Set<string>());

  const handlePurchaseUpdate = useCallback(async (purchase: SubscriptionPurchase | ProductPurchase) => {
    try {
      const receipt = purchase.transactionReceipt;
      const product = products.find(({ productId }) => productId === purchase.productId);
      
      if (product && receipt && !processedTransactions.current.has(purchase.transactionId!)) {
        processedTransactions.current.add(purchase.transactionId!);
        const isSubscription = product.type === ProductType.SUBSCRIPTION;
        if (Platform.OS === 'android') {
          const purchaseReceipt = { subscription: isSubscription, ...JSON.parse(receipt) };
          console.log('purchaseProduct', { _id: product._id });
          await purchaseProduct({ _id: product._id, receipt: purchaseReceipt });
        } else {
          console.log('purchaseProduct', { _id: product._id });
          await purchaseProduct({ _id: product._id, receipt });
        }
        await finishTransaction({ purchase, isConsumable: !isSubscription });
      }
    } catch (error) {
      console.error('handlePurchaseUpdate error:', error);
    }
  }, [products, purchaseProduct]);

  const handlePurchaseError = useCallback((error: PurchaseError) => {
    console.error('Purchase Error:', error);
    // Add additional logging or error handling here if needed
  }, []);

  useEffect(() => {
    getProducts({ platform: Platform.OS });
    getSubscription();
  }, [getProducts, getSubscription]);

  useEffect(() => {
    let purchaseUpdateSubscription: { remove: () => void } | null = null;
    let purchaseErrorSubscription: { remove: () => void } | null = null;

    const setupListeners = async () => {
      if (products.length === 0) {
        return;
      }
      
      await initConnection();

      if (Platform.OS === 'android') {
        await flushFailedPurchasesCachedAsPendingAndroid();
      }

      purchaseUpdateSubscription = purchaseUpdatedListener(handlePurchaseUpdate);
      purchaseErrorSubscription = purchaseErrorListener(handlePurchaseError);
    };

    setupListeners();

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
    };
  }, [handlePurchaseUpdate, handlePurchaseError]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (products.length > 0) {
        const storeItems = await IAPGetProducts({ skus: products.filter(p => p.type === ProductType.PURCHASE).map((p) => p.productId) });
        const storeSItems = await IAPGetSubscriptions({ skus: products.filter(p => p.type === ProductType.SUBSCRIPTION).map((p) => p.productId) });

        setPurchaseItems(storeItems);
        setSubscriptionItems(storeSItems);
      }
    };

    fetchProducts();
  }, [products]);

  return <PointScreen products={products} purchaseItems={purchaseItems} subscriptionItems={subscriptionItems} />;
};

interface Props {
  products: Product[];
  purchaseItems: IAPProduct[];
  subscriptionItems: IAPSubscription[];
}
const PointScreen: React.FC<Props> = ({ products, purchaseItems, subscriptionItems }) => {
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);

  const handleClick = async (sku: string) => {
    try {
      await requestPurchase(Platform.OS === 'ios' ? { sku } : { skus: [sku] });
    } catch (err: any) {
      console.error(err);
    }
  };

  const filteredProducts = products.reduce(
    (obj, product) => {
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
    },
    {
      subscriptionProducts: [] as (IAPSubscription & Product)[],
      purchasableProducts: [] as (IAPProduct & Product)[],
    }
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>픽포미 플러스</Text>
          <Text style={styles.subtitle}>한 달 AI 질문 무제한, 매니저 질문 30회 이용권</Text>
          <Text>{'픽포미 멤버십을 구독하고, 자유롭게 질문해 보세요.\n멤버십은 결제일로부터 한 달이 지나면 자동해지됩니다.'}</Text>
          <View style={styles.productsWrap}>
            {/* {filteredProducts.purchasableProducts.map(product => (
              <View style={styles.productWrap} key={`Point-Product-${product.productId}`}>
                <Text style={styles.productPrice}>
                  {product.displayName} - {product.localizedPrice.replace(/₩(.*)/, '$1원')}
                </Text>
                <Button
                  style={styles.productButton}
                  title="구매하기"
                  size="small"
                  onPress={() => handleClick(product.productId)}
                />
              </View>
            ))} */}

          <View style={styles.productWrap}>
          <Text style={styles.productPrice}>
            월 4,900원
          </Text>
          <Button
            style={styles.productButton}
            title="멤버십 시작하기"
            size="small"
            // onPress={() => handleClick(product.productId)}
          />

        </View>
        <Text style={styles.subtitle}>멤버십 혜택 자세히</Text>
        <View style={styles.benefitRow}>
        <Text style={styles.benefitTitle}>혜택 1: </Text>
        <Text style={styles.benefitContent}>AI 질문하기 매월 무제한 이용 가능</Text>
      </View>
        <View style={styles.benefitRow}>
         <Text style={styles.benefitTitle}>혜택 2: </Text>
          <Text style={styles.benefitContent}>매니저 질문하기 매월 30회 이용 가능</Text>
        </View>


          </View>
        </View>
        
        <View style={styles.content}>
        <Button
            style={styles.startButton}
            title="지금 시작하기"
            size="large"
            // onPress={() => handleClick(product.productId)}
          />
          <Button
            style={styles.termButton}
            title="픽 이용약관"
            variant="text"
            onPress={() => WebBrowser.openBrowserAsync('https://sites.google.com/view/sigongan-useterm/홈')}
            color="tertiary"
            size="small"
          />
          <Text style={styles.terms}>{TERM}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 31,
  },
  title: {
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 18,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 15,
  },
  subtitle: {
    fontWeight: '600',
    fontSize: 14,
    // lineHeight: 17,
    marginBottom: 14,
  },
  benefitTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  benefitContent: {
    fontWeight: '400',
    fontSize: 14,
  },
  productsWrap: {
    marginTop: 20,
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
    marginVertical: 8,
  },
  productButton: {
    width: 117,
    padding: 10,
    backgroundColor: Colors[colorScheme].buttonBackground.primary,
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
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,
    color: 'white',
  },
  termButton: {
     marginTop: 13,
  },
  startButton: {
    marginTop: 40,

  }
});
export default withIAPContext(PurchaseWrapper);


// import React from 'react';
// import { ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'expo-router';
// import { useAtomValue, useSetAtom } from 'jotai';
// import { userDataAtom } from '../stores/auth/atoms';
// import { subscriptionAtom, getProductsAtom, purchaseProductAtom, productsAtom, getSubscriptionAtom } from '../stores/purchase/atoms';
// import { Product, ProductType } from '../stores/purchase/types';
// import Colors from '../constants/Colors';
// import useColorScheme, { ColorScheme } from '../hooks/useColorScheme';
// import * as WebBrowser from 'expo-web-browser';
// import Markdown from 'react-native-markdown-display';

// import Button from '../components/Button';
// import { Text, View } from '../components/Themed';
// import {
//   initConnection,
//   purchaseErrorListener,
//   purchaseUpdatedListener,
//   ProductPurchase,
//   PurchaseError,
//   flushFailedPurchasesCachedAsPendingAndroid,
//   SubscriptionPurchase,
//   requestPurchase,
//   requestSubscription,
//   getProducts as IAPGetProducts,
//   getSubscriptions as IAPGetSubscriptions,
//   Product as IAPProductB,
//   Subscription as IAPSubscriptionB,
//   SubscriptionAndroid,
//   finishTransaction,
//   useIAP,
//   withIAPContext,
//   RequestSubscriptionAndroid,
// } from 'react-native-iap';

// type IAPProduct = Omit<IAPProductB, 'type'>;
// type IAPSubscription = Omit<IAPSubscriptionB, 'type' | 'platform'>;

// const TERM = `
// - 이용방법: 픽은 상품의 '매니저 질문하기' 기능에 대한 유료 이용권입니다. 1픽 당 1개의 질문을 의뢰할 수 있습니다.
// - 이용기간: 구매한 픽은 유효기간 제한 없이 이용 가능합니다.
// - 환불 및 해지: 서비스 환불 및 해지는 고객센터로 문의 부탁드립니다.
// `;

// const PurchaseWrapper = () => {
//   const purchaseProduct = useSetAtom(purchaseProductAtom);
//   const [purchaseItems, setPurchaseItems] = useState<IAPProduct[]>([]);
//   const [subscriptionItems, setSubscriptionItems] = useState<IAPSubscription[]>([]);
//   const getProducts = useSetAtom(getProductsAtom);
//   const getSubscription = useSetAtom(getSubscriptionAtom);
//   const products = useAtomValue(productsAtom);

//   useEffect(() => {
//     getProducts({ platform: Platform.OS });
//   }, [getProducts]);

//   useEffect(() => {
//     getSubscription();
//   }, [getSubscription]);

//   useEffect(() => {
//     if( products.length) {
//       let purchaseUpdateSubscription: any = null;
//       let purchaseErrorSubscription: any = null;
//       initConnection().then(async () => {
//         const storeItems = await IAPGetProducts({ skus: products.filter(p => p.type === ProductType.PURCHASE).map((p) => p.productId) });
//         const storeSItems = await IAPGetSubscriptions({ skus: products.filter(p => p.type === ProductType.SUBSCRIPTION).map((p) => p.productId) });
  
//         setPurchaseItems(storeItems)
//         setSubscriptionItems(storeSItems);
  
//         const addListeners = () => {
//           purchaseUpdateSubscription = purchaseUpdatedListener(
//             async (purchase: SubscriptionPurchase | ProductPurchase) => {
//               const receipt = purchase.transactionReceipt;
  
//               const product = products.find(({ productId }) => productId === purchase.productId);
//               if (!product) {
//                 return;
//               }
//               const isSubscription = product.type === ProductType.SUBSCRIPTION;
//               if (!receipt) {
//                 return;
//               }
//               if (Platform.OS === 'android') {
//                 await purchaseProduct({ _id: product._id, receipt: { subscription: isSubscription, ...JSON.parse(receipt) } });
//               } else {
//                 console.log('purchaseProduct', { _id: product._id });
//                 await purchaseProduct({ _id: product._id, receipt });
//               }
//               await finishTransaction({purchase, isConsumable: !isSubscription });
//             },
//           );
  
//           purchaseErrorSubscription = purchaseErrorListener(
//             (error: PurchaseError) => {
//               console.error('purchaseErrorListener', error);
//             },
//           );
//         };
//         // we make sure that "ghost" pending payment are removed
//         // (ghost = failed pending payment that are still marked as pending in Google's native Vending module cache)
//         if (Platform.OS === 'android') {
//           flushFailedPurchasesCachedAsPendingAndroid().then(addListeners).catch(() => {});
//         } else {
//           console.log('addListeners');
//           addListeners();
//         }
//       });
//       return () => {
//         if (purchaseUpdateSubscription) {
//           purchaseUpdateSubscription.remove();
//           purchaseUpdateSubscription = null;
//         }
    
//         if (purchaseErrorSubscription) {
//           purchaseErrorSubscription.remove();
//           purchaseErrorSubscription = null;
//         }
//       }
//     }
//   }, [products]);
//   return <PointScreen products={products} purchaseItems={purchaseItems} subscriptionItems={subscriptionItems}/>;
// }

// interface Props {
//   products: Product[];
//   purchaseItems: IAPProduct[];
//   subscriptionItems: IAPSubscription[];
// }
// const PointScreen: React.FC<Props> = ({ products, purchaseItems, subscriptionItems }) => {
//     const router = useRouter();
//     const currentSubscription = useAtomValue(subscriptionAtom);
//     const userData = useAtomValue(userDataAtom);
//     const colorScheme = useColorScheme();
//     const styles = useStyles(colorScheme);
//     const {   connected,
//     currentPurchase,
//     currentPurchaseError, } = useIAP();
//     const markdownStyles = StyleSheet.create({text: { fontSize: 14, lineHeight: 20, color: Colors[colorScheme].text.primary}});

//   /*
//   const subscriptionProducts = products.filter(({ type }) => type === 'SUBSCRIPTION');
//   const purchaseProducts = products.filter(({ type }) => type === 'PURCHASE');
//   */

//   const handleClickSub = async (sku: string, offerToken?: string) => {
//     try {
//       if (offerToken) {
//       const subscriptionRequest: RequestSubscriptionAndroid = {
//         subscriptionOffers: [
//           {
//             sku,
//             offerToken,
//           },
//         ],
//       };

//       await requestSubscription(subscriptionRequest);
//       } else {
//         await requestSubscription({ sku });
//       }
//     } catch (err: any) {
//       console.log('error!');
//       console.warn(err.code, err.message);
//     }
//   }
// // for puchase product
//   const handleClick = async (sku: string) => {
//     console.log('handleClick', sku);
//     try {
//       await requestPurchase(
//         Platform.OS === 'ios' ? { sku } : { skus: [sku] },
//       );
//     } catch (err: any) {
//       console.error(err);
//     }
//   };

//   const filteredProducts = products.reduce((obj, product) => {
//     if (product.type === ProductType.PURCHASE) {
//       const item = purchaseItems.find(({ productId }) => product.productId === productId);
//       if (item) {
//         obj.purchasableProducts.push({ ...item, ...product });
//       }
//     } else {
//       const item = subscriptionItems.find(({ productId }) => product.productId === productId);
//       if (item) {
//         obj.subscriptionProducts.push({ ...item, ...product });
//       }
//     }
//     return obj;
//   }, {
//     subscriptionProducts: [] as (IAPSubscription & Product)[],
//     purchasableProducts: [] as (IAPProduct & Product)[],
//   });

//   return (
//     <View style={styles.container}>
//       <ScrollView>
//         <View style={styles.content}>
//           <Text style={styles.title}>
//             픽포미 이용권 구매
//           </Text>
//           <Text style={styles.subtitle}>
//             매니저 질문하기 이용가능
//           </Text>
//           <Text>
//             픽포미 이용권인 '픽'을 구매하여 매니저 질문하기 기능을 이용하실 수 있어요.
//           </Text>
//           <View style={styles.productsWrap}>
//             {filteredProducts.purchasableProducts.map(product => (
//               <View style={styles.productWrap} key={`Point-Product-${product.productId}`}>
//                 <Text style={styles.productPrice}>
//                   {product.displayName} - {product.localizedPrice.replace(/₩(.*)/,'$1원')}
//                 </Text>
//                 <Button
//                   style={styles.productButton}
//                   title="구매하기"
//                   size='small'
//                   onPress={() => handleClick(product.productId)}
//                 />
//               </View>
//             ))}
//           </View>
//         </View>
//         <View style={styles.content}>
//             <Button style={styles.termButton}
//                 title='픽 이용약관'
//                 variant='text'
//                 onPress={() => WebBrowser.openBrowserAsync('https://sites.google.com/view/sigongan-useterm/홈')}
//                 color='tertiary'
//                 size='small'
//             />
//             <Text style={styles.terms}>
//                 {TERM}
//             </Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }

// const useStyles = (colorScheme: ColorScheme) => StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     content: {
//         flex: 1,
//         padding: 31,
//     },
//     title: {
//         fontWeight: '600',
//         fontSize: 20,
//         lineHeight: 24,
//         marginBottom: 18
//     },
//     subtitle: {
//         fontWeight: '600',
//         fontSize: 14,
//         lineHeight: 17,
//         marginBottom: 14
//     },
//     productsWrap: {
//         marginTop: 20,
//     },
//     productWrap: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         width: '100%',
//         padding: 14,
//         borderRadius: 10,
//         borderWidth: 1,
//         borderColor: Colors[colorScheme].borderColor.secondary,
//         marginVertical: 8
//     },
//     productButton: {
//         width: 100,
//         padding: 10,
//         backgroundColor: Colors[colorScheme].buttonBackground.primary,
//     },
//     productPrice: {
//         fontWeight: '600',
//         fontSize: 18,
//         lineHeight: 22,
//     },
//     terms: {
//         marginTop: 12,
//         fontWeight: '400',
//         fontSize: 12,
//         lineHeight: 15,
//     },
//     buttonText: {
//         fontWeight: '600',
//         fontSize: 14,
//         lineHeight: 17,
//         color: 'white'
//     },
//     termButton: {
//         marginTop: 100,
//     },
// });
// export default withIAPContext(PurchaseWrapper);
