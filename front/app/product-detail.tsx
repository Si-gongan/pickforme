import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  findNodeHandle,
  AccessibilityInfo,
  View as RNView,
  Alert,
} from "react-native";
import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";

import useCheckLogin from "../hooks/useCheckLogin";
import useCheckPoint from "../hooks/useCheckPoint";
import Colors from "../constants/Colors";
import {
  searchResultAtom,
  wishProductsAtom,
  mainProductsAtom,
  productDetailAtom,
  productReviewAtom,
  initProductDetailAtom,
  setProductAtom,
  setProductReviewAtom,
  getProductCaptionAtom,
  getProductReviewAtom,
  getProductReportAtom,
  getProductAIAnswerAtom,
  getProductDetailAtom,
  loadingStatusAtom,
  setScrapedProductDetailAtom,
  scrapedProductDetailAtom,
} from "../stores/product/atoms";
import { Product } from "../stores/product/types";
import { sendLogAtom } from "../stores/log/atoms";
import { requestBottomSheetAtom, requestsAtom } from "../stores/request/atoms";

import { Text, View } from "@components";
import { useColorScheme } from "@hooks";
import Button from "../components/Button";
import { numComma } from "../utils/common";
import { useWebView } from "../components/webview-util";
import TabContent from "../components/ProductDetailTabContent";

// 2024
import { TABS, loadingMessages, tabName } from "../utils/common";
import {
  subscriptionAtom,
  getSubscriptionAtom,
} from "../stores/purchase/atoms";
import { isShowNonSubscriberManagerModalAtom } from "../stores/auth/atoms";

import type { ColorScheme } from "@hooks";

interface ProductDetailScreenProps {}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = () => {
  const { productUrl: productUrlBase } = useLocalSearchParams();
  const productUrl = decodeURIComponent(productUrlBase?.toString() ?? "");

  const colorScheme = useColorScheme();
  const styles = useStyles(colorScheme);

  const scrapedProductDetail = useAtomValue(scrapedProductDetailAtom);
  const setScrapedProductDetail = useSetAtom(setScrapedProductDetailAtom);
  const ImageWebView = useWebView({
    productUrl,
    type: "images",
    onMessage: (data) => setScrapedProductDetail({ images: data }),
  });
  const ReviewWebView = useWebView({
    productUrl,
    type: "reviews",
    onMessage: (data) => setScrapedProductDetail({ reviews: data }),
  });

  const getProductDetail = useSetAtom(getProductDetailAtom);
  const initProductDetail = useSetAtom(initProductDetailAtom);
  const setProduct = useSetAtom(setProductAtom);
  const setProductReview = useSetAtom(setProductReviewAtom);
  const getProductCaption = useSetAtom(getProductCaptionAtom);
  const getProductReport = useSetAtom(getProductReportAtom);
  const getProductReview = useSetAtom(getProductReviewAtom);
  const getProductAIAnswer = useSetAtom(getProductAIAnswerAtom);
  const setRequestBottomSheet = useSetAtom(requestBottomSheetAtom);
  const sendLog = useSetAtom(sendLogAtom);

  const productDetail = useAtomValue(productDetailAtom);
  const productReview = useAtomValue(productReviewAtom);
  const mainProducts = useAtomValue(mainProductsAtom);
  const searchResult = useAtomValue(searchResultAtom);
  const [wishlist, setWishlist] = useAtom(wishProductsAtom);
  const requests = useAtomValue(requestsAtom);
  const request = requests
    .filter((req) => req.product)
    .find((req) => decodeURIComponent(req.product!.url) === productUrl);
  const already = wishlist.find(
    (wishProduct) => decodeURIComponent(wishProduct.url) === productUrl
  );
  const product =
    request?.product ||
    searchResult?.products.find(
      (searchItem) => decodeURIComponent(searchItem.url) === productUrl
    ) ||
    [
      ...mainProducts.local.map((section) => section.products).flat(),
      ...mainProducts.special,
      ...mainProducts.random,
    ].find(({ url }) => decodeURIComponent(url) === productUrl) ||
    already ||
    ({ url: productUrl } as Product);
  const isLocal =
    mainProducts.local
      .map((section) => section.products)
      .flat()
      .find(({ url }) => decodeURIComponent(url) === productUrl) !== undefined;

  const [tab, setTab] = useState<TABS>(TABS.CAPTION);
  const loadingStatus = useAtomValue(loadingStatusAtom);

  const [question, setQuestion] = useState("");

  const managerResponseRef = useRef<RNView>(null);
  const captionRef = useRef<RNView>(null);
  const reportRef = useRef<RNView>(null);
  const reviewRef = useRef<RNView>(null);
  const questionRef = useRef<RNView>(null);
  const refs = useState({
    caption: captionRef,
    report: reportRef,
    review: reviewRef,
    question: questionRef,
    manager: managerResponseRef,
  })[0];

  const ReviewWebView = useWebViewReviews({ productUrl, onMessage: (data) => setProductReview(data)});
  const DetailWebView = useWebViewDetail({ productUrl, onMessage: (data) => setProduct(data)});

  useEffect(() => {
    initProductDetail();
  }, [initProductDetail]);

  useEffect(() => {
    if (product) {
      sendLog({
        product: { url: productUrl },
        action: "caption",
        metaData: {},
      });
      getProductDetail(product);
    }
  }, [getProductDetail, productUrl]);

  useEffect(() => {
    const moveFocus = () => {
      const node = findNodeHandle(reportRef.current);
      if (loadingStatus.report === 2 && tab === TABS.REPORT && node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    };
    setTimeout(moveFocus, 500);
  }, [loadingStatus.report, tab]);

  useEffect(() => {
    const moveFocus = () => {
      const node = findNodeHandle(reviewRef.current);
      if (loadingStatus.review === 2 && tab === TABS.REVIEW && node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    };
    setTimeout(moveFocus, 500);
  }, [loadingStatus.review, tab]);

  useEffect(() => {
    const moveFocus = () => {
      const node = findNodeHandle(questionRef.current);
      if (loadingStatus.question === 2 && tab === TABS.QUESTION && node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    };
    setTimeout(moveFocus, 500);
  }, [loadingStatus.question, tab]);

  const handleClickBuy = async () => {
    sendLog({ product: { url: productUrl }, action: "link", metaData: {} });
    await WebBrowser.openBrowserAsync(product.url);
  };

  // TODO
  // const setIsShowNonSubscribedModal = useSetAtom(isShowNonSubscribedModalAtom);
  const handleClickSend = async () => {
    if (!question) {
      Alert.alert("질문을 입력해주세요.");
      return;
    }
    // else if (true) { // 멤버십 미구독자
    // setIsShowNonSubscribedModal(true);
    //   return;
    // }
    getProductAIAnswer(product, question);
    setQuestion("");
    sendLog({ product: { url: productUrl }, action: "question", metaData: {} });
  };

  const handleClickWish = async () => {
    if (already) {
      setWishlist(wishlist.filter((wishProduct) => wishProduct !== already));
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(
          "위시리스트에서 제거되었습니다."
        );
      }, 300);
    } else {
      setWishlist([...wishlist, product]);
      sendLog({ product: { url: productUrl }, action: "like", metaData: {} });
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(
          "위시리스트에 추가되었습니다."
        );
      }, 300);
    }
  };

  // 멤버십 2024
  const subscription = useAtomValue(subscriptionAtom);
  const getSubscription = useSetAtom(getSubscriptionAtom);
  const setIsShowNonSubscriberManageModal = useSetAtom(
    isShowNonSubscriberManagerModalAtom
  );

  const handleClickContact = async () => {
    getSubscription();

    // 구독 정보가 없거나 구독이 만료되었을 때 콜백 호출
    if (!subscription || subscription.isExpired) {
      // 모달 표시

      setIsShowNonSubscriberManageModal(true);
    } else {
      // await WebBrowser.openBrowserAsync('https://pf.kakao.com/_csbDxj'); // asis 시공간 카톡으로 이동
      setRequestBottomSheet(product); // tobe 매니저 질문하기
    }
  };

  const handleClickRequest = useCheckLogin(() => {
    getSubscription();
    // 구독 정보가 없거나 구독이 만료되었을 때 콜백 호출
    if (!subscription || subscription.isExpired) {
      // 모달 표시
      setIsShowNonSubscriberManageModal(true);
    } else {
      console.log("111subscription.purchase.status:", subscription?.isExpired);

      setRequestBottomSheet(product);
    }
  });

  const handlePressAIQuestionTab = useCheckLogin(() => {
    setTab(TABS.QUESTION);
  });

  const moveFocusToProductDetail = (nextTab: TABS) => {
    const moveFocus = () => {
      const node = findNodeHandle(refs[nextTab].current);
      if (loadingStatus[nextTab] === 2 && node) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    };
    setTimeout(moveFocus, 500);
  };

  const handlePressTab = (nextTab: TABS) => {
    if (nextTab === TABS.QUESTION) {
      handlePressAIQuestionTab("");
      return;
    }
    if (loadingStatus[nextTab] === 0 && !productDetail?.[nextTab]) {
      if (nextTab === TABS.REPORT) {
        if (!isLocal && productDetail?.product?.detail_images?.length === 0) {
          let count = 0;
          const interval = setInterval(() => {
            if (count >= 5 || productDetail?.product?.detail_images?.length! > 0) {
              clearInterval(interval);
              sendLog({
                product: { url: productUrl },
                action: "report",
                metaData: {},
              });
              getProductReport(product);
              return;
            }
            count++;
          }, 1000);
        } else {
          sendLog({
            product: { url: productUrl },
            action: "report",
            metaData: {},
          });
          getProductReport(product);
        }
      }
      if (nextTab === TABS.REVIEW) {
        if (!isLocal && productReview.reviews?.length === 0) {
          let count = 0;
          const interval = setInterval(() => {
            if (count >= 5 || productReview.reviews!.length > 0) {
              clearInterval(interval);
              sendLog({
                product: { url: productUrl },
                action: "review",
                metaData: {},
              });
              getProductReview(product);
              return;
            }
            count++;
          }, 1000);
        } else {
          sendLog({
            product: { url: productUrl },
            action: "review",
            metaData: {},
          });
          getProductReview(product);
        }
      }
    }
    setTab(nextTab);
    moveFocusToProductDetail(nextTab);
  };

  const handleRegenerate = () => {
    if (tab === TABS.REPORT) getProductReport();
    if (tab === TABS.REVIEW) getProductReview();
    if (tab === TABS.CAPTION) getProductCaption();
  };

  return (
    <View style={styles.container}>
      <View accessible={false}>
        {!isLocal && ReviewWebView}
        {!isLocal && DetailWebView}
      </View>

      <ScrollView style={styles.scrollView}>
        {!!product ? (
          <View>
            <View style={styles.inner}>
              <Text style={styles.name}>
                {product.name ?? productDetail?.product?.name ?? ""}
              </Text>

              <View
                style={styles.priceWrap}
                accessible
                accessibilityRole="text"
              >
                {productDetail?.product ? (
                  <>
                    {(productDetail?.product?.discount_rate ?? 0) !== 0 && (
                      <Text
                        style={styles.discount_rate}
                        accessibilityLabel={`할인률 ${productDetail?.product?.discount_rate ?? 0}%`}
                      >
                        {productDetail?.product?.discount_rate ?? 0}%
                      </Text>
                    )}
                    <Text
                      style={styles.price}
                      accessibilityLabel={`현재 가격 ${numComma(productDetail?.product?.price ?? 0)}원`}
                    >
                      {numComma(productDetail?.product?.price ?? 0)}원
                    </Text>
                    {(productDetail?.product?.origin_price ?? 0) !== 0 &&
                      productDetail?.product?.price !==
                        productDetail?.product?.origin_price && (
                        <Text
                          style={styles.origin_price}
                          accessibilityLabel={`할인 전 가격 ${numComma(productDetail?.product?.origin_price ?? 0)}원`}
                        >
                          {numComma(productDetail?.product?.origin_price ?? 0)}
                        </Text>
                      )}
                  </>
                ) : (
                  <ActivityIndicator accessibilityLabel="가격 정보 로딩 중" />
                )}
              </View>

              <View style={styles.table}>
                <View style={styles.tableList}>
                  <View style={styles.tableRow} accessible>
                    <Text style={styles.tableHeader}>리뷰</Text>
                    <Text style={styles.tableItem}>
                      {productDetail?.product?.reviews ?? 0} 개
                    </Text>
                  </View>
                  <View style={styles.tableRow} accessible>
                    <Text style={styles.tableHeader}>평점</Text>
                    <Text style={styles.tableItem}>
                      {Math.floor(
                        ((productDetail?.product?.ratings ?? 0) / 20) * 10
                      ) / 10}{" "}
                      점
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TabNavigation
              styles={styles}
              tab={tab}
              handlePressTab={handlePressTab}
              isLocal={isLocal}
            />

            <TabContent
              tab={tab}
              productDetail={productDetail}
              refs={refs}
              question={question}
              setQuestion={setQuestion}
              handleClickSend={handleClickSend}
              request={request}
              loadingMessages={loadingMessages}
              loadingStatus={loadingStatus}
              handleRegenerate={handleRegenerate}
            />
          </View>
        ) : (
          <View style={styles.inner}>
            <Text>상품 정보를 불러오는 데 실패했습니다.</Text>
          </View>
        )}
      </ScrollView>

      <ActionButtons
        styles={styles}
        product={product}
        handleClickBuy={handleClickBuy}
        handleClickContact={handleClickContact}
        handleClickRequest={handleClickRequest}
        handleClickWish={handleClickWish}
        isWish={!!already}
        isRequest={!!request}
      />
    </View>
  );
};

interface TabNavigationProps {
  styles: ReturnType<typeof useStyles>;
  tab: TABS;
  handlePressTab: (tab: TABS) => void;
  isLocal: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  styles,
  tab,
  handlePressTab,
  isLocal,
}) => (
  <View style={styles.tabWrap}>
    {Object.values(TABS).map((TAB) =>
      isLocal && TAB === TABS.QUESTION ? null : (
        <View style={styles.tab} key={`Requests-Tab-${TAB}`}>
          <Button
            style={[styles.tabButton, tab === TAB && styles.tabButtonActive]}
            textStyle={[
              styles.tabButtonText,
              tab === TAB && styles.tabButtonTextActive,
            ]}
            variant="text"
            title={tabName[TAB]}
            size="medium"
            color={tab === TAB ? "primary" : "tertiary"}
            onPress={() => handlePressTab(TAB)}
            accessibilityLabel={`${tabName[TAB]} 탭`}
            selected={tab === TAB}
          />
        </View>
      )
    )}
  </View>
);

interface ActionButtonsProps {
  styles: ReturnType<typeof useStyles>;
  product: Product;
  handleClickBuy: () => void;
  handleClickContact: () => void;
  handleClickRequest: (e: any) => void;
  handleClickWish: () => void;
  isWish: boolean;
  isRequest: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  styles,
  product,
  handleClickBuy,
  handleClickContact,
  handleClickRequest,
  handleClickWish,
  isWish,
  isRequest,
}) => (
  <View style={styles.buttonWrap}>
    <View style={styles.buttonOuter}>
      <Button
        title="구매하러 가기"
        onPress={handleClickBuy}
        style={styles.button}
        size="small"
        disabled={!product}
      />
    </View>
    {product?.platform === "thezam" ? (
      <View style={styles.buttonOuter}>
        <Button
          title="대리구매 요청하기"
          onPress={handleClickContact}
          style={[styles.button, styles.button2]}
          color="tertiary"
          size="small"
          disabled={!product}
        />
      </View>
    ) : (
      <View style={styles.buttonOuter}>
        <Button
          title={isRequest ? "추가 질문하기" : "매니저에게 질문하기"}
          onPress={isRequest ? handleClickContact : handleClickRequest}
          style={[styles.button, styles.button2]}
          color="tertiary"
          size="small"
          disabled={!product}
        />
      </View>
    )}
    {isWish ? (
      <Pressable
        onPress={handleClickWish}
        accessible
        accessibilityLabel="위시리스트 제거"
        accessibilityRole="button"
        disabled={!product}
      >
        <Image
          style={styles.heartIcon}
          source={require("../assets/images/discover/icHeartFill.png")}
        />
      </Pressable>
    ) : (
      <Pressable
        onPress={handleClickWish}
        accessible
        accessibilityLabel="위시리스트 추가"
        accessibilityRole="button"
        disabled={!product}
      >
        <Image
          style={styles.heartIcon}
          source={require("../assets/images/discover/icHeart.png")}
        />
      </Pressable>
    )}
  </View>
);

const useStyles = (colorScheme: ColorScheme) =>
  StyleSheet.create({
    container: {
      width: "100%",
      flex: 1,
      paddingTop: 20,
    },
    inner: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    scrollView: {
      flex: 1,
    },
    image: {
      marginBottom: 32,
      flex: 1,
      aspectRatio: 1,
      resizeMode: "contain",
      width: "100%",
      backgroundColor: Colors[colorScheme].borderColor.tertiary,
    },
    name: {
      fontSize: 18,
      fontWeight: "600",
      lineHeight: 20,
      marginBottom: 11,
    },
    priceWrap: {
      flexDirection: "row",
      alignItems: "center",
    },
    price: {
      fontSize: 18,
      fontWeight: "700",
      lineHeight: 22,
      marginRight: 6,
    },
    discount_rate: {
      fontSize: 18,
      fontWeight: "700",
      lineHeight: 22,
      color: "#4A5CA0",
      marginRight: 6,
    },
    origin_price: {
      color: "#576084",
      fontSize: 13,
      fontWeight: "500",
      textDecorationLine: "line-through",
    },
    seperator: {
      width: "100%",
      backgroundColor: Colors[colorScheme].borderColor.primary,
      height: 1,
      marginVertical: 25,
    },
    table: {
      marginTop: 31,
      flexDirection: "column",
    },
    tableTitle: {
      marginBottom: 10,
    },
    tableList: {
      gap: 8,
      flexDirection: "column",
    },
    tableRow: {
      gap: 43,
      flexDirection: "row",
    },
    tableHeader: {
      width: 65,
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
    },
    tableItem: {
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      flexGrow: 1,
    },
    tabWrap: {
      flexDirection: "row",
      alignContent: "stretch",
      alignItems: "center",
      justifyContent: "space-between",
    },
    tab: {
      flex: 1,
    },
    tabButton: {
      paddingVertical: 16,
      flex: 1,
      flexDirection: "row",
      borderRadius: 0,
      borderBottomWidth: 1,
      borderColor: "#EFEFEF",
    },
    tabButtonActive: {
      borderBottomColor: Colors[colorScheme].text.primary,
      borderBottomWidth: 2,
    },
    tabButtonText: {
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 17,
    },
    tabButtonTextActive: {
      color: Colors[colorScheme].text.primary,
      fontWeight: "700",
    },
    detailWrap: {
      padding: 28,
    },
    buttonWrap: {
      gap: 16,
      paddingTop: 15,
      paddingBottom: 30,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].borderColor.tertiary,
      alignContent: "stretch",
      alignItems: "center",
      flexDirection: "row",
    },
    button: {
      borderRadius: 4,
      height: 50,
    },
    button2: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: Colors[colorScheme].buttonBackground.primary,
    },
    heartIcon: {
      width: 24,
      height: 22,
    },
    buttonOuter: {
      flex: 1,
    },
    loadingIcon: {},
    indicatorWrap: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
    },
    inputWrap: {
      flex: 1,
      marginBottom: 16,
      paddingLeft: 12,
      paddingRight: 8,
      paddingVertical: 8,
      borderRadius: 8,
      height: 40,
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "white",
      borderColor: "#5F5F5F",
      borderWidth: 1,
      flexDirection: "row",
    },
    textArea: {
      fontSize: 14,
      flex: 1,
      width: "100%",
    },
    sendIcon: {
      flexShrink: 0,
      marginLeft: 3,
      width: 26,
      height: 26,
      justifyContent: "center",
      alignItems: "center",
    },
    boldText: {
      fontWeight: "700",
    },
  });

export default ProductDetailScreen;
