import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    findNodeHandle,
    AccessibilityInfo,
    View as RNView,
    Alert
} from 'react-native';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import useCheckLogin from '../hooks/useCheckLogin';
import useCheckPoint from '../hooks/useCheckPoint';
import Colors from '../constants/Colors';
import {
    searchResultAtom,
    wishProductsAtom,
    mainProductsAtom,
    productDetailAtom,
    productReviewAtom,
    initProductDetailAtom,
    getProductCaptionAtom,
    getProductReviewAtom,
    getProductReportAtom,
    getProductAIAnswerAtom,
    getProductDetailAtom,
    setProductAtom,
    setProductReviewAtom,
    loadingStatusAtom,
    setScrapedProductDetailAtom,
    scrapedProductDetailAtom,
    LoadingStatus
} from '../stores/product/atoms';
import { Product } from '../stores/product/types';
import { requestBottomSheetAtom, requestsAtom } from '../stores/request/atoms';

import { Text, View, Button_old as Button } from '@components';
import useColorScheme from '../hooks/useColorScheme';
import {
    isShowNonSubscriberManagerModalAtom,
    isShowSubscriptionModalAtom,
    isShowRequestModalAtom
} from '../stores/auth/atoms';
// import { useWebView } from '../components/webview-util';
import { useWebViewReviews } from '../components/webview-reviews';
import { useWebViewDetail } from '../components/webview-detail';

import TabContent from '../components/ProductDetailTabContent';

import { TABS, loadingMessages, tabName, numComma, checkIsExpired } from '../utils/common';
import { subscriptionAtom, getSubscriptionAtom } from '../stores/purchase/atoms';

import type { ColorScheme } from '@hooks';
import BackHeader from '../components/BackHeader';

import Modal from 'react-native-modal';
import Request from '../components/BottomSheet/Request';
import { userAtom } from '@stores';
import { useTabData } from '@/hooks/product-detail/useTabData';
import { membershipModalTypeAtom } from '../stores/auth/atoms';
import { logEvent } from '@/services/firebase';
import BackIcon from '@/assets/icons/BackIcon';
import HeartFilledIcon from '@/assets/icons/HeartFilledIcon';
import HeartOutlineIcon from '@/assets/icons/HeartOutlineIcon';

interface ProductDetailScreenProps {}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = () => {
    const { productUrl: productUrlBase, url: urlBase } = useLocalSearchParams();
    const productUrl = decodeURIComponent((productUrlBase || urlBase)?.toString() ?? '');
    const userData = useAtomValue(userAtom);
    const setMembershipModalType = useSetAtom(membershipModalTypeAtom);

    // 쿠팡 링크가 아닌 경우 처리
    if (!productUrl.includes('coupang')) {
        Alert.alert('알림', '쿠팡 상품만 확인할 수 있습니다.');
        router.back();
        return null;
    }

    const colorScheme = useColorScheme();
    const styles = useStyles(colorScheme);

    const getProductDetail = useSetAtom(getProductDetailAtom); // 여기서 caption도 호출함.. 왜 이렇게??
    const initProductDetail = useSetAtom(initProductDetailAtom);
    const getProductCaption = useSetAtom(getProductCaptionAtom);
    const getProductReport = useSetAtom(getProductReportAtom);
    const getProductReview = useSetAtom(getProductReviewAtom);
    const getProductAIAnswer = useSetAtom(getProductAIAnswerAtom);
    const setRequestBottomSheet = useSetAtom(requestBottomSheetAtom);
    const setProductReview = useSetAtom(setProductReviewAtom);
    const setProduct = useSetAtom(setProductAtom);

    const productDetail = useAtomValue(productDetailAtom);
    const productReview = useAtomValue(productReviewAtom);
    const mainProducts = useAtomValue(mainProductsAtom);
    const searchResult = useAtomValue(searchResultAtom);
    const [wishlist, setWishlist] = useAtom(wishProductsAtom);
    const requests = useAtomValue(requestsAtom);
    // 현재 상품에 대한 모든 request를 필터링하고 최신순(updatedAt 기준)으로 정렬
    const productRequests = requests
        .filter(req => req.product && decodeURIComponent(req.product.url) === productUrl)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    // 이전 코드와의 호환성을 위해 첫 번째 request도 유지 (필요한 경우 사용)
    const request = productRequests.length > 0 ? productRequests[0] : undefined;
    const already = wishlist.find(wishProduct => decodeURIComponent(wishProduct.url) === productUrl);

    const isLocal =
        mainProducts.local
            .map(section => section.products)
            .flat()
            .find(({ url }) => decodeURIComponent(url) === productUrl) !== undefined;

    const [tab, setTab] = useState<TABS>(TABS.CAPTION);
    const [question, setQuestion] = useState('');
    const loadingStatus = useAtomValue(loadingStatusAtom);

    const managerResponseRef = useRef<RNView>(null);
    const captionRef = useRef<RNView>(null);
    const reportRef = useRef<RNView>(null);
    const reviewRef = useRef<RNView>(null);
    const questionRef = useRef<RNView>(null);

    const refs = useMemo(
        () => ({
            caption: captionRef,
            report: reportRef,
            review: reviewRef,
            question: questionRef,
            manager: managerResponseRef
        }),
        []
    );

    // const ReviewWebView = useWebViewReviews({
    //     productUrl,
    //     onMessage: data => {
    //         setProductReview(data);
    //     }
    // });

    // URL 비교 헬퍼 함수 추출
    const isSameProductUrl = (url: string) => decodeURIComponent(url) === productUrl;

    const product = useMemo(() => {
        // 1. 요청에서 제품 확인
        if (request?.product) return request.product;

        // 2. 검색 결과에서 제품 확인
        if (searchResult?.products) {
            const foundProduct = searchResult.products.find(item => isSameProductUrl(item.url));
            if (foundProduct) return foundProduct;
        }

        // 3. 메인 제품 목록에서 제품 확인
        const allProducts = [
            ...mainProducts.local.map(section => section.products).flat(),
            ...mainProducts.special,
            ...mainProducts.random
        ];

        const mainProduct = allProducts.find(({ url }) => isSameProductUrl(url));
        if (mainProduct) return mainProduct;

        // 4. 위시리스트에서 제품 확인
        if (already) return already;

        // 5. 기본값 반환
        return { url: productUrl } as Product;
    }, [productUrl, request, searchResult, mainProducts, wishlist]);

    const DetailWebView = useWebViewDetail({
        productUrl,
        onError: () => {
            console.error('상품 정보를 불러오는 데 실패했습니다.');
        },
        onMessage: data => {
            setProduct(data);
        }
    });

    const scrapedProductDetail = useAtomValue(scrapedProductDetailAtom);
    const setScrapedProductDetail = useSetAtom(setScrapedProductDetailAtom);

    useTabData({
        tab,
        productDetail,
        productUrl,
        productReview: productReview.reviews,
        loadingStatus
    });

    useEffect(() => {
        initProductDetail();
    }, [initProductDetail]);

    useEffect(() => {
        if (product) getProductDetail(product);
    }, [productUrl]);

    useEffect(() => {
        if (productDetail?.product) {
            getProductReview();
        }
    }, [productDetail?.product]);

    const handleClickBuy = async () => {
        await WebBrowser.openBrowserAsync(product.url);
    };

    // TODO
    const setIsShowNonSubscriberManagerModal = useSetAtom(isShowNonSubscriberManagerModalAtom);
    const handleClickSend = useCheckLogin(async () => {
        // AI포미에게 질문하는 함수
        if (!question) {
            Alert.alert('질문을 입력해주세요.');
            return;
        }

        if (!productDetail?.product?.detail_images || !productDetail?.product?.thumbnail || !productReview.reviews) {
            Alert.alert('상품 정보를 불러오고 있어요.');
            return;
        }

        // AI 질문을 위한 모달 타입 설정
        setMembershipModalType('AI');

        // 구독 및 AI 포인트 체크
        await getSubscription();
        if (userData && userData.aiPoint !== undefined && userData.aiPoint <= 0) {
            setIsShowNonSubscriberManagerModal(true);
            return;
        }
        logEvent('question_send', {
            screen: 'ProductDetailScreen',
            item_id: productUrl,
            item_name: productDetail?.product?.name,
            question: question,
            category: 'product_detail'
        });

        try {
            await getProductAIAnswer(question);
            setQuestion('');
        } catch (error: any) {
            console.error('API 호출 실패:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });
        }
    });

    const handleClickWish = async () => {
        if (already) {
            setWishlist(wishlist.filter(wishProduct => wishProduct !== already));
            setTimeout(() => {
                AccessibilityInfo.announceForAccessibility('위시리스트에서 제거되었습니다.');
            }, 300);
        } else {
            // product 객체에 productDetail의 reviews와 ratings 정보 추가
            const enrichedProduct = {
                ...product,
                reviews: productDetail?.product?.reviews ?? product.reviews ?? 0,
                ratings: productDetail?.product?.ratings ?? product.ratings ?? 0
            };

            setWishlist([...wishlist, enrichedProduct]);
            setTimeout(() => {
                AccessibilityInfo.announceForAccessibility('위시리스트에 추가되었습니다.');
            }, 300);
        }
    };

    // 멤버십 2024
    const subscription = useAtomValue(subscriptionAtom);
    const getSubscription = useSetAtom(getSubscriptionAtom);
    const setIsShowNonSubscriberManageModal = useSetAtom(isShowNonSubscriberManagerModalAtom);
    const setIsShowRequestModal = useSetAtom(isShowRequestModalAtom);
    const setIsShowSubscriptionModal = useSetAtom(isShowSubscriptionModalAtom);
    const isShowRequestModal = useAtomValue(isShowRequestModalAtom);

    const toggleRequestModal = () => {
        setIsShowRequestModal(!isShowRequestModal);
    };

    const handleClickContact = async () => {
        await getSubscription();

        // 구독 정보가 없거나 구독이 만료되었을 때 콜백 호출
        if (!subscription || checkIsExpired(subscription.expiresAt)) {
            // 모달 표시
            setIsShowNonSubscriberManageModal(true);
        } else {
            // await WebBrowser.openBrowserAsync('https://pf.kakao.com/_csbDxj'); // asis 시공간 카톡으로 이동
            setRequestBottomSheet(product); // tobe 매니저 질문하기
        }
    };

    const handleClickRequest = useCheckLogin(async () => {
        // 매니저에게 질문하기 함수
        await getSubscription();

        // 구독 정보가 없거나 구독이 만료되었을 때 콜백 호출
        setMembershipModalType('MANAGER');
        if (userData && userData.point !== undefined && userData.point <= 0) {
            // 픽포미 멤버십 첫 구매 팝업
            setIsShowNonSubscriberManageModal(true);

            // 픽포미 멤버십 구독이 완료됬어요 팝업
            // 구독 히스토리에 대한 로직 확인 필요
            // setIsShowSubscriptionModal(true);
        } else {
            setRequestBottomSheet(product);
            setIsShowRequestModal(true);
        }
    });

    const handlePressAIQuestionTab = () => setTab(TABS.QUESTION);

    const handlePressTab = (nextTab: TABS) => {
        if (nextTab === TABS.QUESTION) handlePressAIQuestionTab();

        setTab(nextTab);
    };

    const handleRegenerate = () => {
        if (tab === TABS.REPORT) getProductReport();
        if (tab === TABS.REVIEW) getProductReview();
        if (tab === TABS.CAPTION) getProductCaption();
    };

    // scrollDown 이벤트
    const { component: reviewsComponent, scrollDown } = useWebViewReviews({
        productUrl: product?.url || '',
        onMessage: data => {
            // 리뷰가 있을 때만 요약(캡션) 생성 API 호출
            if (data && data.length > 0) {
                // 리뷰 데이터 설정
                setProductReview(data);
                getProductReview(); // 리뷰 요약 요청
            }
        }
    });

    const handleLoadMore = () => {
        scrollDown();
    };

    return (
        <View style={styles.container} onAccessibilityEscape={() => router.back()}>
            <BackHeader />

            <View accessible={false}>
                {!isLocal && DetailWebView}
                {!isLocal && reviewsComponent}
            </View>

            <Modal
                isVisible={isShowRequestModal}
                onBackButtonPress={toggleRequestModal}
                onBackdropPress={toggleRequestModal}
                animationIn="slideInUp" // 기본값, 아래에서 위로 올라옴
                animationInTiming={300} // 애니메이션 속도(ms)
                style={{
                    justifyContent: 'flex-end', // 화면 하단에 모달 위치
                    margin: 0 // 마진 제거
                }}
                avoidKeyboard={true}
            >
                <Request />
            </Modal>

            <ScrollView style={styles.scrollView}>
                {!!product ? (
                    <View>
                        <View style={styles.inner}>
                            <Text style={styles.name}>{product.name ?? productDetail?.product?.name ?? ''}</Text>

                            <View style={styles.priceWrap} accessible accessibilityRole="text">
                                {productDetail?.product?.name ? (
                                    <>
                                        {(productDetail?.product?.discount_rate ?? 0) !== 0 && (
                                            <Text
                                                style={styles.discount_rate}
                                                accessibilityLabel={`할인률 ${
                                                    productDetail?.product?.discount_rate ?? 0
                                                }%`}
                                            >
                                                {productDetail?.product?.discount_rate ?? 0}%
                                            </Text>
                                        )}
                                        <Text
                                            style={styles.price}
                                            accessibilityLabel={`현재 가격 ${numComma(
                                                productDetail?.product?.price ?? 0
                                            )}원`}
                                        >
                                            {numComma(productDetail?.product?.price ?? 0)}원
                                        </Text>
                                        {(productDetail?.product?.origin_price ?? 0) !== 0 &&
                                            productDetail?.product?.price !== productDetail?.product?.origin_price && (
                                                <Text
                                                    style={styles.origin_price}
                                                    accessibilityLabel={`할인 전 가격 ${numComma(
                                                        productDetail?.product?.origin_price ?? 0
                                                    )}원`}
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
                                        <Text style={styles.tableItem}>{productDetail?.product?.reviews ?? 0} 개</Text>
                                    </View>
                                    <View style={styles.tableRow} accessible>
                                        <Text style={styles.tableHeader}>평점</Text>
                                        <Text style={styles.tableItem}>
                                            {Math.floor(((productDetail?.product?.ratings ?? 0) / 20) * 10) / 10} 점
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <TabNavigation styles={styles} tab={tab} handlePressTab={handlePressTab} isLocal={isLocal} />

                        <TabContent
                            tab={tab}
                            refs={refs}
                            question={question}
                            setQuestion={setQuestion}
                            handleClickSend={handleClickSend}
                            request={request}
                            productRequests={productRequests}
                            loadingMessages={loadingMessages}
                            loadingStatus={loadingStatus}
                            handleRegenerate={handleRegenerate}
                            scrapedProductDetail={scrapedProductDetail}
                            handleLoadMore={handleLoadMore}
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
                colorScheme={colorScheme}
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

const TabNavigation: React.FC<TabNavigationProps> = ({ styles, tab, handlePressTab, isLocal }) => (
    <View style={styles.tabWrap}>
        {Object.values(TABS).map(TAB =>
            isLocal && TAB === TABS.QUESTION ? null : (
                <View style={styles.tab} key={`Requests-Tab-${TAB}`}>
                    <Button
                        style={[styles.tabButton, tab === TAB && styles.tabButtonActive]}
                        textStyle={[styles.tabButtonText, tab === TAB && styles.tabButtonTextActive]}
                        variant="text"
                        title={tabName[TAB]}
                        size="medium"
                        color={tab === TAB ? 'primary' : 'tertiary'}
                        onPress={() => handlePressTab(TAB)}
                        accessible
                        accessibilityLabel={`${tabName[TAB]} 탭`}
                        accessibilityRole="button"
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
    handleClickRequest: (e?: any) => void;
    handleClickWish: () => void;
    isWish: boolean;
    isRequest: boolean;
    colorScheme: ColorScheme;
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
    colorScheme
}) => {
    const handleRequestWithLoading = useCheckLogin(handleClickRequest);

    return (
        <View style={[styles.buttonWrap]}>
            <View style={styles.buttonOuter}>
                <Button
                    title="구매하러 가기"
                    onPress={handleClickBuy}
                    style={styles.button}
                    size="small"
                    disabled={!product}
                    textStyle={styles.buttonText}
                />
            </View>
            {product?.platform === 'thezam' ? (
                <View style={styles.buttonOuter}>
                    <Button
                        title="대리구매 요청하기"
                        onPress={handleClickContact}
                        style={[styles.button, styles.button2]}
                        color="tertiary"
                        size="small"
                        disabled={!product}
                        textStyle={styles.button2Text}
                    />
                </View>
            ) : (
                <View style={styles.buttonOuter}>
                    <Button
                        title="매니저에게 질문하기"
                        onPress={handleRequestWithLoading}
                        style={[styles.button, styles.button2]}
                        color="tertiary"
                        size="small"
                        disabled={!product}
                        textStyle={styles.button2Text}
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
                    <HeartFilledIcon size={24} color={Colors[colorScheme].text.primary} opacity={1} />
                </Pressable>
            ) : (
                <Pressable
                    onPress={handleClickWish}
                    accessible
                    accessibilityLabel="위시리스트 추가"
                    accessibilityRole="button"
                    disabled={!product}
                >
                    <HeartOutlineIcon size={24} color={Colors[colorScheme].text.primary} opacity={1} />
                </Pressable>
            )}
        </View>
    );
};

const useStyles = (colorScheme: ColorScheme) =>
    StyleSheet.create({
        container: {
            width: '100%',
            flex: 1,
            paddingTop: 20,
            backgroundColor: Colors[colorScheme].background.primary
        },
        header: {
            height: 60,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            backgroundColor: Colors[colorScheme].background.secondary,
            zIndex: 1
        },
        backButton: {
            padding: 8,
            marginTop: 12,
            marginLeft: 12
        },
        backIcon: {
            width: 24,
            height: 24
        },
        inner: {
            paddingHorizontal: 20,
            paddingBottom: 40
        },
        scrollView: {
            flex: 1
        },
        image: {
            marginBottom: 32,
            flex: 1,
            aspectRatio: 1,
            resizeMode: 'contain',
            width: '100%',
            backgroundColor: Colors[colorScheme].border.third
        },
        name: {
            fontSize: 18,
            fontWeight: '600',
            lineHeight: 20,
            marginBottom: 11,
            color: Colors[colorScheme].text.primary
        },
        priceWrap: {
            flexDirection: 'row',
            alignItems: 'center'
        },
        price: {
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 22,
            marginRight: 6,
            color: Colors[colorScheme].text.primary
        },
        discount_rate: {
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 22,
            color: '#4A5CA0',
            marginRight: 6
        },
        origin_price: {
            fontSize: 13,
            fontWeight: '500',
            textDecorationLine: 'line-through',
            color: Colors[colorScheme].text.secondary
        },
        seperator: {
            width: '100%',
            backgroundColor: Colors[colorScheme].border.primary,
            height: 1,
            marginVertical: 25
        },
        table: {
            marginTop: 31,
            flexDirection: 'column'
        },
        tableTitle: {
            marginBottom: 10
        },
        tableList: {
            gap: 8,
            flexDirection: 'column'
        },
        tableRow: {
            gap: 43,
            flexDirection: 'row'
        },
        tableHeader: {
            width: 65,
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 20,
            color: Colors[colorScheme].text.primary
        },
        tableItem: {
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 20,
            flexGrow: 1,
            color: Colors[colorScheme].text.primary
        },
        tabWrap: {
            flexDirection: 'row',
            alignContent: 'stretch',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: Colors[colorScheme].background.primary
        },
        tab: {
            flex: 1
        },
        tabButton: {
            paddingVertical: 16,
            flex: 1,
            flexDirection: 'row',
            borderRadius: 0,
            borderBottomWidth: 1,
            borderColor: Colors[colorScheme].border.third
        },
        tabButtonActive: {
            borderBottomColor: Colors[colorScheme].text.primary,
            borderBottomWidth: 2
        },
        tabButtonText: {
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 17,
            color: Colors[colorScheme].text.primary
        },
        tabButtonTextActive: {
            fontWeight: '700',
            color: Colors[colorScheme].text.primary
        },
        detailWrap: {
            padding: 28
        },
        buttonWrap: {
            gap: 16,
            paddingTop: 15,
            paddingBottom: 30,
            paddingHorizontal: 20,
            borderTopWidth: 1,
            borderTopColor: Colors[colorScheme].border.third,
            alignContent: 'stretch',
            alignItems: 'center',
            flexDirection: 'row',
            backgroundColor: Colors[colorScheme].background.primary
        },
        button: {
            borderRadius: 4,
            height: 50,
            backgroundColor: Colors[colorScheme].button.primary.background
        },
        buttonText: {
            color: Colors[colorScheme].text.secondary
        },
        button2: {
            backgroundColor: Colors[colorScheme].background.primary,
            borderWidth: 1,
            borderColor: Colors[colorScheme].button.primary.background
        },
        button2Text: {
            color: Colors[colorScheme].text.primary
        },
        heartIcon: {
            width: 24,
            height: 22
        },
        buttonOuter: {
            flex: 1
        },
        loadingIcon: {},
        indicatorWrap: {
            flexDirection: 'row',
            gap: 10,
            alignItems: 'center'
        },
        inputWrap: {
            flex: 1,
            marginBottom: 16,
            paddingLeft: 12,
            paddingRight: 8,
            paddingVertical: 8,
            borderRadius: 8,
            height: 40,
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: Colors[colorScheme].background.primary,
            borderColor: Colors[colorScheme].border.primary,
            borderWidth: 1,
            flexDirection: 'row'
        },
        textArea: {
            fontSize: 14,
            flex: 1,
            width: '100%',
            color: Colors[colorScheme].text.primary
        },
        sendIcon: {
            flexShrink: 0,
            marginLeft: 3,
            width: 26,
            height: 26,
            justifyContent: 'center',
            alignItems: 'center'
        },
        boldText: {
            fontWeight: '700'
        }
    });

export default ProductDetailScreen;
