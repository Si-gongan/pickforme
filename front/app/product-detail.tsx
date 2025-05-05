import React, { useState, useEffect, useRef } from 'react';
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
    scrapedProductDetailAtom
} from '../stores/product/atoms';
import { Product } from '../stores/product/types';
import { sendLogAtom } from '../stores/log/atoms';
import { requestBottomSheetAtom, requestsAtom } from '../stores/request/atoms';

import { Text, View, Button_old as Button } from '@components';
import useColorScheme from '../hooks/useColorScheme';
import { isShowNonSubscriberManagerModalAtom, isShowSubscriptionModalAtom } from '../stores/auth/atoms';
// import { useWebView } from '../components/webview-util';
import { useWebViewReviews } from '../components/webview-reviews';
import { useWebViewDetail } from '../components/webview-detail';

import TabContent from '../components/ProductDetailTabContent';

// 2024
import { TABS, loadingMessages, tabName, numComma } from '../utils/common';
import { subscriptionAtom, getSubscriptionAtom } from '../stores/purchase/atoms';

import type { ColorScheme } from '@hooks';
import BackHeader from '../components/BackHeader';

import Modal from 'react-native-modal';
import Request from '../components/BottomSheet/Request';
import { userAtom } from '@stores';

interface ProductDetailScreenProps {}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = () => {
    const { productUrl: productUrlBase, url: urlBase } = useLocalSearchParams();
    const productUrl = decodeURIComponent((productUrlBase || urlBase)?.toString() ?? '');
    const userData = useAtomValue(userAtom);

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
    const sendLog = useSetAtom(sendLogAtom);

    const productDetail = useAtomValue(productDetailAtom);
    const productReview = useAtomValue(productReviewAtom);
    const mainProducts = useAtomValue(mainProductsAtom);
    const searchResult = useAtomValue(searchResultAtom);
    const [wishlist, setWishlist] = useAtom(wishProductsAtom);
    const requests = useAtomValue(requestsAtom);
    const request = requests
        .filter(req => req.product)
        .find(req => decodeURIComponent(req.product!.url) === productUrl);
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
    const refs = useState({
        caption: captionRef,
        report: reportRef,
        review: reviewRef,
        question: questionRef,
        manager: managerResponseRef
    })[0];

    // const ReviewWebView = useWebViewReviews({
    //     productUrl,
    //     onMessage: data => {
    //         console.log('ReviewWebView 데이터 수신:', data.length);
    //         setProductReview(data);
    //     }
    // });

    // URL 비교 헬퍼 함수 추출
    const isSameProductUrl = (url: string) => decodeURIComponent(url) === productUrl;

    // 제품 찾기 로직을 단계별로 명확하게 구성
    const findProduct = (): Product => {
        console.log('[findProduct] 검색 시작 - productUrl:', productUrl);
        console.log('[findProduct] request:', request);

        // 1. 요청에서 제품 확인
        if (request?.product) {
            console.log('[findProduct] request.product에서 찾음:', request.product);
            return request.product;
        }

        console.log('[findProduct] searchResult:', searchResult);
        // 2. 검색 결과에서 제품 확인
        if (searchResult?.products) {
            const foundProduct = searchResult.products.find(item => isSameProductUrl(item.url));
            if (foundProduct) {
                console.log('[findProduct] searchResult.products에서 찾음:', foundProduct);
                return foundProduct;
            }
        }

        console.log('[findProduct] mainProducts:', mainProducts);
        // 3. 메인 제품 목록에서 제품 확인
        const allProducts = [
            ...mainProducts.local.map(section => section.products).flat(),
            ...mainProducts.special,
            ...mainProducts.random
        ];
        console.log('[findProduct] allProducts 길이:', allProducts.length);

        const mainProduct = allProducts.find(({ url }) => isSameProductUrl(url));
        if (mainProduct) {
            console.log('[findProduct] allProducts에서 찾음:', mainProduct);
            return mainProduct;
        }

        console.log('[findProduct] already(wishlist):', already);
        // 4. 위시리스트에서 제품 확인
        if (already) {
            console.log('[findProduct] wishlist에서 찾음:', already);
            return already;
        }

        // 5. 기본값 반환
        console.log('[findProduct] 어디서도 찾지 못해 기본값 반환: { url: productUrl }');
        return { url: productUrl } as Product;
    };
    const product = findProduct();

    const DetailWebView = useWebViewDetail({
        productUrl,
        onMessage: data => {
            console.log('DetailWebView 이미지 데이터 수신:', data.detail_images?.length);
            setProduct(data);
        }
    });

    const scrapedProductDetail = useAtomValue(scrapedProductDetailAtom);
    const setScrapedProductDetail = useSetAtom(setScrapedProductDetailAtom);

    useEffect(() => {
        initProductDetail();
    }, [initProductDetail]);

    useEffect(() => {
        console.log('productUrl 상태변화 :', productUrl, productDetail);
        if (product) {
            sendLog({ product: { url: productUrl }, action: 'caption', metaData: {} });
            getProductDetail(product);
        }
    }, [productUrl]);

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
        sendLog({ product: { url: productUrl }, action: 'link', metaData: {} });
        await WebBrowser.openBrowserAsync(product.url);
    };

    // TODO
    // const setIsShowNonSubscribedModal = useSetAtom(isShowNonSubscribedModalAtom);
    const handleClickSend = async () => {
        if (!question) {
            Alert.alert('질문을 입력해주세요.');
            return;
        }

        try {
            await getProductAIAnswer(question);
            setQuestion('');
            sendLog({ product: { url: productUrl }, action: 'question', metaData: {} });
        } catch (error: any) {
            console.error('API 호출 실패:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });
        }
    };

    const handleClickWish = async () => {
        if (already) {
            setWishlist(wishlist.filter(wishProduct => wishProduct !== already));
            setTimeout(() => {
                AccessibilityInfo.announceForAccessibility('위시리스트에서 제거되었습니다.');
            }, 300);
        } else {
            setWishlist([...wishlist, product]);
            sendLog({ product: { url: productUrl }, action: 'like', metaData: {} });
            setTimeout(() => {
                AccessibilityInfo.announceForAccessibility('위시리스트에 추가되었습니다.');
            }, 300);
        }
    };

    // 멤버십 2024
    const subscription = useAtomValue(subscriptionAtom);
    const getSubscription = useSetAtom(getSubscriptionAtom);
    const setIsShowNonSubscriberManageModal = useSetAtom(isShowNonSubscriberManagerModalAtom);
    const setIsShowSubscriptionModal = useSetAtom(isShowSubscriptionModalAtom);
    const isShowSubscriptionModal = useAtomValue(isShowSubscriptionModalAtom);

    const toggleSubscriptionModal = () => {
        setIsShowSubscriptionModal(!isShowSubscriptionModal);
    };

    const handleClickContact = async () => {
        await getSubscription();

        // 구독 정보가 없거나 구독이 만료되었을 때 콜백 호출
        if (!subscription || subscription.isExpired) {
            // 모달 표시
            setIsShowNonSubscriberManageModal(true);
        } else {
            // await WebBrowser.openBrowserAsync('https://pf.kakao.com/_csbDxj'); // asis 시공간 카톡으로 이동
            setRequestBottomSheet(product); // tobe 매니저 질문하기
        }
    };

    const handleClickRequest = useCheckLogin(async (message: string) => {
        // setRequestBottomSheet(product);
        // setIsShowSubscriptionModal(false);
        // setTimeout(() => {
        //     setIsShowSubscriptionModal(true);
        // }, 300);

        await getSubscription();
        console.log('subscription:', JSON.stringify(subscription));
        console.log('userData:', userData.point);

        // 구독 정보가 없거나 구독이 만료되었을 때 콜백 호출
        if (userData.point && parseInt(userData.point.toString()) < 1) {
            console.log('setIsShowNonSubscriberManageModal');
            // 모달 표시
            setIsShowNonSubscriberManageModal(true);
        } else {
            console.log('setRequestBottomSheet');
            setRequestBottomSheet(product);
            setIsShowSubscriptionModal(true);
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
            handlePressAIQuestionTab('');
        }

        console.log('handlePressTab:', nextTab, loadingStatus[nextTab], productDetail?.[nextTab]);

        if (loadingStatus[nextTab] === 0 && !productDetail?.[nextTab]) {
            console.log('handlePressTab api 호출');
            if (nextTab === TABS.REPORT) {
                if (!isLocal && productDetail?.product?.detail_images?.length === 0) {
                    let count = 0;
                    const interval = setInterval(() => {
                        if (count >= 5 || productDetail?.product?.detail_images?.length! > 0) {
                            clearInterval(interval);
                            sendLog({ product: { url: productUrl }, action: 'report', metaData: {} });
                            getProductReport();
                            return;
                        }
                        count++;
                    }, 1000);
                } else {
                    sendLog({ product: { url: productUrl }, action: 'report', metaData: {} });
                    getProductReport();
                }
            }
            if (nextTab === TABS.REVIEW) {
                if (!isLocal && productReview.reviews?.length === 0) {
                    let count = 0;
                    const interval = setInterval(() => {
                        if (count >= 5 || productReview.reviews!.length > 0) {
                            clearInterval(interval);
                            sendLog({ product: { url: productUrl }, action: 'review', metaData: {} });
                            getProductReview();
                            return;
                        }
                        count++;
                    }, 1000);
                } else {
                    sendLog({ product: { url: productUrl }, action: 'review', metaData: {} });
                    getProductReview();
                }
            }
        }
        setTab(nextTab);
        moveFocusToProductDetail(nextTab);
    };

    const handleRegenerate = () => {
        console.log('handleRegenerate 호출됨:', { tab });
        if (tab === TABS.REPORT) getProductReport();
        if (tab === TABS.REVIEW) getProductReview();
        if (tab === TABS.CAPTION) getProductCaption();
    };

    // scrollDown 이벤트
    const { component: reviewsComponent, scrollDown } = useWebViewReviews({
        productUrl: product?.url || '',
        onMessage: data => {
            console.log('받은 리뷰 데이터:', data.length);

            // 리뷰가 있을 때만 요약(캡션) 생성 API 호출
            if (data && data.length > 0) {
                console.log('리뷰 데이터 있음, 요약 생성 API 호출');
                // 리뷰 데이터 설정
                setProductReview(data);
                getProductReview(); // 리뷰 요약 요청
            }
        }
    });

    const handleLoadMore = () => {
        console.log('handleLoadMore');
        scrollDown();
    };

    return (
        <View style={styles.container}>
            <BackHeader />

            <View accessible={false}>
                {!isLocal && DetailWebView}
                {!isLocal && reviewsComponent}
            </View>

            <Modal
                isVisible={isShowSubscriptionModal}
                onBackButtonPress={toggleSubscriptionModal}
                onBackdropPress={toggleSubscriptionModal}
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
                            productDetail={productDetail}
                            refs={refs}
                            question={question}
                            setQuestion={setQuestion}
                            handleClickSend={handleClickSend}
                            request={request}
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
                        onPress={() => {
                            console.log('tabnavigation on press', tab, TAB);
                            handlePressTab(TAB);
                        }}
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
    const handleRequestWithLoading = () => {
        handleClickRequest();
    };

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
                    <Image style={styles.heartIcon} source={require('../assets/images/discover/icHeartFill.png')} />
                </Pressable>
            ) : (
                <Pressable
                    onPress={handleClickWish}
                    accessible
                    accessibilityLabel="위시리스트 추가"
                    accessibilityRole="button"
                    disabled={!product}
                >
                    <Image style={styles.heartIcon} source={require('../assets/images/discover/icHeart.png')} />
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
            padding: 8
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
            lineHeight: 17
        },
        tabButtonTextActive: {
            fontWeight: '700'
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
