import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useAtomValue, useSetAtom } from "jotai";

import { useColorScheme } from "@hooks";
import { Colors } from "@constants";
import { Text, View, Button } from "@components";
import { isShowUnsubscribeModalAtom, userDataAtom } from "@stores";
import {
  subscriptionAtom,
  getSubscriptionAtom,
  subscriptionListAtom,
  getSubscriptionListAtom,
  purchaseListAtom,
  getPurchaseListAtom,
  productsAtom,
} from "../stores/purchase/atoms";
import {
  formatTime,
  formatDate,
  formatDateAfterOneMonth,
} from "../utils/common";
import Autolink from "react-native-autolink";
// import Subscription from "../components/Subscription";
import { PointScreen } from "./subscription";

import { Platform, Linking } from "react-native";
import { getProductsAtom, purchaseProductAtom } from "../stores/purchase/atoms";
import * as WebBrowser from "expo-web-browser";
import Markdown from "react-native-markdown-display";
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
  deepLinkToSubscriptions,
} from "react-native-iap";
import { Product, ProductType } from "../stores/purchase/types";

import type { ColorScheme } from "@hooks";

type IAPProduct = Omit<IAPProductB, "type">;
type IAPSubscription = Omit<IAPSubscriptionB, "type" | "platform">;

const ANDROID_UPDATE_URL =
  "https://play.google.com/store/apps/details?id=com.sigonggan.pickforme";
const IOS_UPDATE_URL =
  "https://apps.apple.com/kr/app/%ED%94%BD%ED%8F%AC%EB%AF%B8/id6450741514";

const PurchaseHistoryWrapper = () => {
  const purchaseProduct = useSetAtom(purchaseProductAtom);
  const [purchaseItems, setPurchaseItems] = useState<IAPProduct[]>([]);
  const [subscriptionItems, setSubscriptionItems] = useState<IAPSubscription[]>(
    []
  );
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
          skus: products
            .filter((p) => p.type === ProductType.SUBSCRIPTION)
            .map((p) => p.productId),
        });

        // setPurchaseItems(storeItems)
        setSubscriptionItems(storeSItems);

        const addListeners = () => {
          purchaseUpdateSubscription = purchaseUpdatedListener(
            async (purchase: SubscriptionPurchase | ProductPurchase) => {
              const receipt = purchase.transactionReceipt;

              const product = products.find(
                ({ productId }) => productId === purchase.productId
              );
              if (!product) {
                return;
              }
              const isSubscription = product.type === ProductType.SUBSCRIPTION;
              if (!receipt) {
                return;
              }
              if (Platform.OS === "android") {
                await purchaseProduct({
                  _id: product._id,
                  receipt: {
                    subscription: isSubscription,
                    ...JSON.parse(receipt),
                  },
                });
              } else {
                await purchaseProduct({ _id: product._id, receipt });
              }
              await finishTransaction({
                purchase,
                isConsumable: !isSubscription,
              });
            }
          );

          purchaseErrorSubscription = purchaseErrorListener(
            (error: PurchaseError) => {
              console.error("purchaseErrorListener", error);
            }
          );
        };
        // we make sure that "ghost" pending payment are removed
        // (ghost = failed pending payment that are still marked as pending in Google's native Vending module cache)
        if (Platform.OS === "android") {
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
  return (
    <PointHistoryScreen
      products={products}
      purchaseItems={purchaseItems}
      subscriptionItems={subscriptionItems}
    />
  );
};

export const PointHistoryScreen: React.FC<Props> = ({
  products,
  purchaseItems,
  subscriptionItems,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const currentSubscription = useAtomValue(subscriptionAtom);
  const subscriptions = useAtomValue(subscriptionListAtom);
  const userData = useAtomValue(userDataAtom);
  const styles = useStyles(colorScheme);

  const getCurrentSubscription = useSetAtom(getSubscriptionAtom);
  const getSubscriptionList = useSetAtom(getSubscriptionListAtom);


  const filteredProducts = products.reduce(
    (obj, product) => {
      if (product.type === ProductType.PURCHASE) {
        // 단건 로직
        const item = purchaseItems.find(
          ({ productId }) => product.productId === productId
        );
        if (item) {
          obj.purchasableProducts.push({ ...item, ...product });
        }
      } else {
        const item = subscriptionItems.find(
          ({ productId }) => product.productId === productId
        );
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
      console.log("error!");
      console.warn(err.code, err.message);
    }
  };

  useEffect(() => {
    getCurrentSubscription();
    getSubscriptionList();
  }, [getCurrentSubscription, getSubscriptionList]);

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>멤버십 구매 내역</Text>
          {currentSubscription && (
            <>
              <Text style={styles.subtitle}>전체</Text>
              <View style={styles.purchaseStatus}>
                <View style={styles.row}>
                  <Text>{formatDate(currentSubscription?.createdAt)} 결제</Text>
                </View>
                <View style={styles.row}>
                  <Text>픽포미 플러스 월간 이용권</Text>
                  <Text>4,900원</Text>
                </View>
              </View>

              <Button
                style={styles.purchaseButton}
                title="멤버십 해지하기"
                size="small"
                onPress={() => router.replace("/")}
              />
            </>
          )}
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions.some((subscription) => !subscription.isExpired) ? ( // 구독 중인 항목 필터링
              subscriptions
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                ) // 가장 최근 날짜로 정렬
                .slice(0, 1) // 하나의 구독만 표시
                .map((subscription, index) => (
                  <React.Fragment key={`subscription-${index}`}>
                    <Text style={styles.subtitle}>전체</Text>
                    <View
                      key={`subscription-${index}`}
                      style={styles.purchaseWrap}
                    >
                      <Text style={styles.purchaseDate}>
                        {formatDate(subscription.createdAt)} 결제
                      </Text>
                      <View style={styles.row}>
                        <Text style={styles.purchaseTitle}>
                          {subscription.product.displayName} 월간 이용권
                        </Text>
                        <Text style={styles.purchasePrice}>
                          {subscription.purchase.isTrial ? "무료" : "4,900원"}
                        </Text>
                      </View>
                    </View>
                    {/* <Button
                      style={styles.purchaseButton}
                      title="멤버십 해지하기"
                      size="small"
                      // onPress={() => router.replace('/'+ANDROID_UPDATE_URL)}
                      onPress={
                        () => {
                          setIsShowNonSubscribedModal(true);
                        }
                        // async () => {
                        // try {
                        //   // SKU 값과 필요한 옵션을 추가
                        //   await deepLinkToSubscriptions({
                        //     sku: "pickforme_basic",  // 실제 구독 상품 SKU
                        //     isAmazonDevice: false  // Amazon 장치가 아닌 경우 false로 설정
                        //   });
                        // } catch (err) {
                        //   console.error("구독 관리 페이지로 이동하는 중 오류 발생:", err);
                        // }
                        // const url = Platform.OS === 'android' ? ANDROID_UPDATE_URL : IOS_UPDATE_URL;
                        // Linking.openURL(url); // 플랫폼에 맞는 스토어 URL을 엽니다.
                        // }
                      }
                    /> */}
                  </React.Fragment>
                ))
            ) : (
              <>
                {filteredProducts.subscriptionProducts.map((product) => {
                  const color: "primary" | "tertiary" = "tertiary";
                  const buttonTextProps = { color };
                  if (product.platform === "android") {
                    const subscriptionOffer = (
                      product as unknown as SubscriptionAndroid
                    ).subscriptionOfferDetails.find(
                      (subscriptionOfferDetail) =>
                        subscriptionOfferDetail.basePlanId.replace("-", "_") ===
                        product.productId
                    );
                    if (!subscriptionOffer) {
                      return null;
                    }
                    return (
                      <View
                        key={`Point-Product-${product.productId}`}
                        style={styles.productWrap}
                      >
                        <Text style={styles.productPrice}>
                          월{" "}
                          {subscriptionOffer.pricingPhases.pricingPhaseList[0].formattedPrice.replace(
                            /₩(.*)/,
                            "$1원"
                          )}
                        </Text>
                        <Button
                          style={styles.productButton}
                          title="멤버십 시작하기"
                          size="small"
                          // onPress={() => handleClickSub(product.productId, subscriptionOffer.offerToken)}
                          onPress={() => router.replace("/subscription")}
                        />
                      </View>
                    );
                  }
                  return (
                    <View
                      key={`Point-Product-${product.productId}`}
                      style={styles.productWrap}
                    >
                      <Text style={styles.productPrice}>
                        월{" "}
                        {(product as any).localizedPrice.replace(
                          /₩(.*)/,
                          "$1원"
                        )}
                      </Text>
                      <Button
                        style={styles.productButton}
                        title="멤버십 시작하기"
                        size="small"
                        // onPress={() => handleClickSub(product.productId)}
                        onPress={() => router.replace("/subscription")}
                      />
                    </View>
                  );
                })}
              </>
            )
          ) : (
            <>
              <Text style={styles.subtitle}>구매 내역이 없습니다.</Text>
              <Text>
                {
                  "픽포미 멤버십을 구독하고, 자유롭게 질문해 보세요.\n멤버십은 결제일로부터 한 달이 지나면 자동해지됩니다."
                }
              </Text>
              {filteredProducts.subscriptionProducts.map((product) => {
                const color: "primary" | "tertiary" = "tertiary";
                const buttonTextProps = { color };
                if (product.platform === "android") {
                  const subscriptionOffer = (
                    product as unknown as SubscriptionAndroid
                  ).subscriptionOfferDetails.find(
                    (subscriptionOfferDetail) =>
                      subscriptionOfferDetail.basePlanId.replace("-", "_") ===
                      product.productId
                  );
                  if (!subscriptionOffer) {
                    return null;
                  }
                  return (
                    <View
                      key={`Point-Product-${product.productId}`}
                      style={styles.productWrap}
                    >
                      <Text style={styles.productPrice}>
                        월{" "}
                        {subscriptionOffer.pricingPhases.pricingPhaseList[0].formattedPrice.replace(
                          /₩(.*)/,
                          "$1원"
                        )}
                      </Text>
                      <Button
                        style={styles.productButton}
                        title="멤버십 시작하기"
                        size="small"
                        // onPress={() => handleClickSub(product.productId, subscriptionOffer.offerToken)}
                        onPress={() => router.replace("/subscription")}
                      />
                    </View>
                  );
                }
                return (
                  <View
                    key={`Point-Product-${product.productId}`}
                    style={styles.productWrap}
                  >
                    <Text style={styles.productPrice}>
                      월{" "}
                      {(product as any).localizedPrice.replace(/₩(.*)/, "$1원")}
                    </Text>
                    <Button
                      style={styles.productButton}
                      title="멤버십 시작하기"
                      size="small"
                      // onPress={() => handleClickSub(product.productId)}
                      onPress={() => router.replace("/subscription")}
                    />
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
interface Props {
  products: Product[];
  purchaseItems: IAPProduct[];
  subscriptionItems: IAPSubscription[];
}

const useStyles = (colorScheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 31,
    },
    row: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontWeight: "600",
      fontSize: 20,
      lineHeight: 24,
      marginBottom: 18,
    },
    subtitle: {
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 17,
      marginBottom: 14,
    },
    seperator: {
      width: "100%",
      height: 0.5,
      backgroundColor: Colors[colorScheme].borderColor.primary,
      marginVertical: 20,
    },
    purchaseStatus: {
      width: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 10,
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor.secondary,
      marginBottom: 12,
    },
    purchaseWrap: {
      width: "100%",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: 14,
      paddingBottom: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor.secondary,
      marginVertical: 8,
    },
    purchaseTitle: {
      fontSize: 16,
      lineHeight: 19,
    },
    purchasePrice: {
      fontWeight: "600",
      fontSize: 16,
      lineHeight: 19,
    },
    purchaseDate: {
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 17,
      marginBottom: 8,
    },
    terms: {
      marginTop: 12,
      fontWeight: "400",
      fontSize: 12,
      lineHeight: 15,
    },
    buttonText: {
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 17,
      color: "white",
    },
    purchaseButton: {
      width: 120,
      padding: 10,
      marginLeft: "auto",
    },
    productWrap: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor.secondary,
      marginVertical: 24,
    },
    productButton: {
      width: 120,
      padding: 10,
      backgroundColor: Colors[colorScheme].buttonBackground.primary,
    },
    productPrice: {
      fontWeight: "600",
      fontSize: 18,
      lineHeight: 22,
    },
  });

export default withIAPContext(PurchaseHistoryWrapper);
