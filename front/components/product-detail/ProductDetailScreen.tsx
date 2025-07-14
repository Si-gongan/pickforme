import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { router, useLocalSearchParams } from 'expo-router';
import Modal from 'react-native-modal';

import useColorScheme from '../../hooks/useColorScheme';
import { Colors } from '@constants';
import {
    productDetailAtom,
    initProductDetailAtom,
    getProductDetailAtom,
    setProductAtom,
    setProductReviewAtom,
    productReviewAtom,
    loadingStatusAtom
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

interface ProductDetailScreenProps {}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = () => {
    const { productUrl: productUrlBase, url: urlBase } = useLocalSearchParams();
    const productUrl = decodeURIComponent((productUrlBase || urlBase)?.toString() ?? '');

    const colorScheme = useColorScheme();
    const styles = useStyles(colorScheme);

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

    // 질문 상태 (먼저 선언)
    const [question, setQuestion] = useState('');

    // 커스텀 훅들
    const { product, productRequests, request, wishlistItem, isLocal } = useProductData({ productUrl });
    const { tab, isTabPressed, handlePressTab, handleRegenerate } = useProductTabs();
    const { handleClickBuy, handleClickWish, handleClickSend, handleClickRequest, handleClickContact } =
        useProductActions({ product, productUrl, wishlistItem, question, setQuestion });

    // 웹뷰에서 정보를 가져오는 것이 실패했을 때 서버측 크롤러 API 호출
    const { handleWebViewError, isLoading: isFallbackLoading } = useWebViewFallback({
        productUrl
    });

    // 웹뷰 관련
    const DetailWebView = useWebViewDetail({
        productUrl,
        onError: () => {
            console.error('상품 정보 오류');
            handleWebViewError(); // 서버 API 호출
        },
        onMessage: data => {
            setProduct(data);
        }
    });

    const { component: reviewsComponent, scrollDown } = useWebViewReviews({
        productUrl: product?.url || '',
        onMessage: data => {
            if (data && data.length > 0) {
                setProductReview(data);
            }
        },
        onError: () => {
            console.error('상품 리뷰 오류');
            handleWebViewError(); // 서버 API 호출
        }
    });

    const handleLoadMore = () => {
        scrollDown();
    };

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
    }, [initProductDetail]);

    useEffect(() => {
        if (product) {
            getProductDetail(product);
        }
    }, [productUrl, getProductDetail]);

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
