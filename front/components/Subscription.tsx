import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { StyleSheet, Platform } from "react-native";
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
} from "react-native-iap";

import {
  subscriptionAtom,
  getProductsAtom,
  purchaseProductAtom,
  productsAtom,
  getSubscriptionAtom,
} from "../stores/purchase/atoms";
import { Product, ProductType } from "../stores/purchase/types";
import { Text, View } from "@components";
import Button from "../components/Button";
import { Colors } from "@constants";
import { useColorScheme } from "@hooks";

import type { ColorScheme } from "@hooks";

type IAPProduct = Omit<IAPProductB, "type">;
type IAPSubscription = Omit<IAPSubscriptionB, "type" | "platform">;

const PurchaseWrapper = () => {
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
    <PointScreen
      products={products}
      purchaseItems={purchaseItems}
      subscriptionItems={subscriptionItems}
    />
  );
};

interface Props {
  products: Product[];
  purchaseItems: IAPProduct[];
  subscriptionItems: IAPSubscription[];
}

const PointScreen: React.FC<Props> = ({
  products,
  purchaseItems,
  subscriptionItems,
}) => {
  const purchaseProduct = useSetAtom(purchaseProductAtom);
  // const [purchaseItems, setPurchaseItems] = useState<IAPProduct[]>([]);
  // const [subscriptionItems, setSubscriptionItems] = useState<IAPSubscription[]>([]);
  const getProducts = useSetAtom(getProductsAtom);
  const getSubscription = useSetAtom(getSubscriptionAtom);
  // const products = useAtomValue(productsAtom);
  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);

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

  return (
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
                onPress={() =>
                  handleClickSub(
                    product.productId,
                    subscriptionOffer.offerToken
                  )
                }
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
              월 {(product as any).localizedPrice.replace(/₩(.*)/, "$1원")}
            </Text>
            <Button
              style={styles.productButton}
              title="멤버십 시작하기"
              size="small"
              onPress={() => handleClickSub(product.productId)}
            />
          </View>
        );
      })}
    </>
  );
};

const useStyles = (colorScheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 31,
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
    termButton: {
      marginTop: 100,
    },
  });

withIAPContext(PurchaseWrapper);
