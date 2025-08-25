import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { router, useLocalSearchParams } from 'expo-router';
import Modal from 'react-native-modal';
import 'react-native-get-random-values';

import useColorScheme from '../../hooks/useColorScheme';
import { Colors } from '@constants';
import {
    productDetailAtom,
    initProductDetailAtom,
    getProductDetailAtom,
    setProductAtom,
    setProductReviewAtom,
    productReviewAtom,
    loadingStatusAtom,
    setProductLoadingStatusAtom,
    LoadingStatus
} from '../../stores/product/atoms';
import { isShowRequestModalAtom } from '../../stores/auth/atoms';

import { Text, View } from '@components';
import BackHeader from '../BackHeader';
import Request from '../BottomSheet/Request';

// 리팩토링된 컴포넌트들
import ProductInfo from './ProductInfo';
import TabNavigation from './TabNavigation';
import ActionButtons from './ActionButtons';
import TabContent from './TabContent';

// 커스텀 훅들
import { useProductData } from '../../hooks/product-detail/useProductData';
import { useProductActions } from '../../hooks/product-detail/useProductActions';
import { useProductTabs } from '../../hooks/product-detail/useProductTabs';
import { useTabData } from '@/hooks/product-detail/useTabData';

// 웹뷰 관련
import { useWebViewReviews } from '../webview-reviews';
import { useWebViewDetail } from '../webview-detail';
import { useWebViewFallback } from '@/hooks/useWebViewFallback';
import { TABS } from '@/utils/common';
import { v4 as uuidv4 } from 'uuid';
import { logCrawlProcessResult } from '@/utils/crawlLog';
import { logEvent, logViewItemDetail } from '@/services/firebase';

interface ProductDetailScreenProps {}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = () => {
    const {
        productUrl: productUrlBase,
        url: urlBase,
        tab: tabBase,
        requestId: requestIdBase,
        source
    } = useLocalSearchParams();
    const productUrl = decodeURIComponent((productUrlBase || urlBase)?.toString() ?? '');
    const initialTab = (tabBase?.toString() as TABS) ?? TABS.CAPTION;

    const requestId = useRef(requestIdBase?.toString() ?? uuidv4());
    const startDate = useRef(new Date());

    const isFromLink = source?.toString() === 'link';

    const colorScheme = useColorScheme();
    const styles = useStyles(colorScheme);

    const linkSearchCompletedRef = useRef(false);
    const linkSearchDetailOkRef = useRef(false);
    const linkSearchReviewOkRef = useRef(false);

    // 쿠팡 링크가 아닌 경우 처리
    if (!productUrl.includes('coupang')) {
        Alert.alert('알림', '쿠팡 상품만 확인할 수 있습니다.');
        router.back();
        return null;
    }

    // Atoms
    const productDetail = useAtomValue(productDetailAtom);
    const productReview = useAtomValue(productReviewAtom);
    const loadingStatus = useAtomValue(loadingStatusAtom);
    const isShowRequestModal = useAtomValue(isShowRequestModalAtom);
    const setIsShowRequestModal = useSetAtom(isShowRequestModalAtom);

    const getProductDetail = useSetAtom(getProductDetailAtom);
    const initProductDetail = useSetAtom(initProductDetailAtom);
    const setProduct = useSetAtom(setProductAtom);
    const setProductReview = useSetAtom(setProductReviewAtom);
    const setProductLoadingStatus = useSetAtom(setProductLoadingStatusAtom);

    // 질문 상태 (먼저 선언)
    const [question, setQuestion] = useState('');

    // 커스텀 훅들
    const { product, productRequests, request, wishlistItem, isLocal } = useProductData({ productUrl });
    const { tab, isTabPressed, handlePressTab, handleRegenerate } = useProductTabs(initialTab);
    const { handleClickBuy, handleClickWish, handleClickSend, handleClickRequest, handleClickContact } =
        useProductActions({ product, productUrl, wishlistItem, question, requestId: requestId.current, setQuestion });

    // 웹뷰에서 정보를 가져오는 것이 실패했을 때 서버측 크롤러 API 호출
    const { handleWebViewError, isLoading: isFallbackLoading } = useWebViewFallback({
        productUrl,
        requestId: requestId.current,
        // 서버 크롤링까지 마치면 이제 크롤링은 끝난 상황. 이제 최종적으로 각 탭에 필요한 데이터가 있는지 확인하고 그에 따라 loading status 업데이트
        onComplete: ({ canLoadReport, canLoadReview, canLoadCaption }) => {
            // 링크 검색으로 들어왔을때의 조건 파악 후 최종 완료 로깅
            const hasDetail =
                !!product?.thumbnail || (Array.isArray(product?.detail_images) && product.detail_images.length > 0);
            linkSearchDetailOkRef.current = linkSearchDetailOkRef.current || hasDetail;

            const hasReviewFromState = Array.isArray(productReview?.reviews) && productReview.reviews.length > 0;
            linkSearchReviewOkRef.current = linkSearchReviewOkRef.current || canLoadReview || hasReviewFromState;

            // 최종 한 번만 완료 로깅
            tryFinalizeLinkSearchComplete('server');

            const updates: {
                caption?: LoadingStatus;
                review?: LoadingStatus;
                report?: LoadingStatus;
            } = {};

            // report 탭에 필요한 데이터가 없으면 NO_DATA로 설정
            if (!canLoadReport) {
                updates.report = LoadingStatus.NO_DATA;
            }

            // review 탭에 필요한 데이터가 없으면 NO_DATA로 설정
            if (!canLoadReview) {
                updates.review = LoadingStatus.NO_DATA;
            }

            // caption 탭에 필요한 데이터가 없으면 NO_DATA로 설정
            if (!canLoadCaption) {
                updates.caption = LoadingStatus.NO_DATA;
            }

            // 업데이트가 있으면 상태 변경
            if (Object.keys(updates).length > 0) {
                setProductLoadingStatus(updates);
            }
        }
    });

    // 웹뷰 관련
    const DetailWebView = useWebViewDetail({
        productUrl,
        onError: () => {
            const durationMs = new Date().getTime() - startDate.current.getTime();

            logCrawlProcessResult({
                requestId: requestId.current,
                productUrl,
                processType: 'webview-detail',
                success: false,
                durationMs,
                fields: {
                    name: false,
                    thumbnail: false,
                    detail_images: false
                }
            });

            handleWebViewError(); // 서버 API 호출
        },
        onMessage: data => {
            const durationMs = new Date().getTime() - startDate.current.getTime();

            setProduct(data);

            // ✅ 이미지 충족 판정: 썸네일 or 상세이미지 배열
            const hasDetail =
                !!data?.thumbnail || (Array.isArray(data?.detail_images) && data.detail_images.length > 0);
            linkSearchDetailOkRef.current = hasDetail;

            logCrawlProcessResult({
                requestId: requestId.current,
                productUrl,
                processType: 'webview-detail',
                success: true,
                durationMs,
                fields: {
                    name: !!data.name,
                    thumbnail: !!data.thumbnail,
                    detail_images: Array.isArray(data?.detail_images) && data.detail_images.length > 0
                }
            });

            // 리뷰가 이미 OK였다면 여기서 완료
            if (linkSearchReviewOkRef.current) {
                tryFinalizeLinkSearchComplete('webview');
            }
        }
    });

    const { component: reviewsComponent, scrollDown } = useWebViewReviews({
        productUrl: product?.url || '',
        onMessage: data => {
            if (data && data.length > 0) {
                setProductReview(data);
            }

            const durationMs = new Date().getTime() - startDate.current.getTime();

            linkSearchReviewOkRef.current = Array.isArray(data) && data.length > 0;

            logCrawlProcessResult({
                requestId: requestId.current,
                productUrl,
                processType: 'webview-review',
                success: true,
                durationMs,
                fields: {
                    reviews: Array.isArray(data) && data.length > 0
                }
            });

            // 이미지가 이미 OK였다면 여기서 완료
            if (linkSearchDetailOkRef.current) {
                tryFinalizeLinkSearchComplete('webview');
            }
        },
        onError: () => {
            const durationMs = new Date().getTime() - startDate.current.getTime();

            logCrawlProcessResult({
                requestId: requestId.current,
                productUrl,
                processType: 'webview-review',
                success: false,
                durationMs,
                fields: {
                    reviews: false
                }
            });

            handleWebViewError(); // 서버 API 호출
        }
    });

    const handleLoadMore = () => {
        scrollDown();
    };

    // 링크검색 완료 로깅 헬퍼
    function tryFinalizeLinkSearchComplete(tag: 'webview' | 'server') {
        if (!isFromLink) return; // 링크 유입이 아닐 때는 링크 지표 찍지 않음
        if (linkSearchCompletedRef.current) return; // 중복 방지

        const success = linkSearchDetailOkRef.current && linkSearchReviewOkRef.current;
        const durationMs = Date.now() - startDate.current.getTime();

        logEvent('link_search_complete', {
            request_id: requestId.current,
            url: productUrl,
            domain: 'coupang',
            success,
            duration_ms: durationMs,
            source: tag, // 최종 판정 경로
            has_thumbnail_or_detail: linkSearchDetailOkRef.current,
            has_reviews: linkSearchReviewOkRef.current
        });

        linkSearchCompletedRef.current = true;
    }

    // 탭 데이터 관리
    useTabData({
        tab,
        productDetail,
        productUrl,
        productReview: productReview.reviews,
        loadingStatus
    });

    // 초기화
    useEffect(() => {
        initProductDetail();
        return () => {
            initProductDetail();
        };
    }, [initProductDetail]);

    useEffect(() => {
        // URL이 바뀌면 타이머/플래그 초기화
        startDate.current = new Date();
        linkSearchCompletedRef.current = false;
        linkSearchDetailOkRef.current = false;
        linkSearchReviewOkRef.current = false;
    }, [productUrl]);

    useEffect(() => {
        if (product) {
            getProductDetail(product);
        }
    }, [productUrl, getProductDetail]);

    useEffect(() => {
        if (isFromLink) {
            logEvent('link_search_page_view', {
                request_id: requestId.current,
                url: productUrl,
                domain: 'coupang'
            });
        }
    }, [isFromLink, productUrl]);

    useEffect(() => {
        if (!product) return;

        logViewItemDetail({
            item_id: productUrl,
            item_name: product?.name,
            category: 'product_detail',
            price: product?.price
        });
    }, [productUrl]);

    // 모달 관리
    const toggleRequestModal = () => {
        setIsShowRequestModal(!isShowRequestModal);
    };

    // 질문 전송 핸들러 (상태 초기화 포함)
    const handleSendQuestion = async (questionText: string) => {
        await handleClickSend(questionText);
        setQuestion(''); // 질문 전송 후 입력창 초기화
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
                animationIn="slideInUp"
                animationInTiming={300}
                style={styles.modalStyle}
                avoidKeyboard={true}
            >
                <Request />
            </Modal>

            <ScrollView style={styles.scrollView}>
                {product ? (
                    <View>
                        <ProductInfo product={product} />

                        <TabNavigation tab={tab} handlePressTab={handlePressTab} isLocal={isLocal} />

                        <TabContent
                            tab={tab}
                            question={question}
                            setQuestion={setQuestion}
                            handleClickSend={handleSendQuestion}
                            request={request}
                            productRequests={productRequests}
                            loadingStatus={loadingStatus}
                            handleRegenerate={handleRegenerate}
                            handleLoadMore={handleLoadMore}
                            isTabPressed={isTabPressed}
                        />
                    </View>
                ) : (
                    <View style={styles.inner}>
                        <Text>상품 정보를 불러오는 데 실패했습니다.</Text>
                    </View>
                )}
            </ScrollView>

            <ActionButtons
                product={product}
                handleClickBuy={handleClickBuy}
                handleClickContact={handleClickContact}
                handleClickRequest={handleClickRequest}
                handleClickWish={handleClickWish}
                isWish={!!wishlistItem}
                isRequest={!!request}
            />
        </View>
    );
};

const useStyles = (colorScheme: 'light' | 'dark') =>
    StyleSheet.create({
        container: {
            width: '100%',
            flex: 1,
            paddingTop: 20,
            backgroundColor: Colors[colorScheme].background.primary
        },
        scrollView: {
            flex: 1
        },
        inner: {
            paddingHorizontal: 20,
            paddingBottom: 40
        },
        modalStyle: {
            justifyContent: 'flex-end',
            margin: 0
        }
    });

export default ProductDetailScreen;
