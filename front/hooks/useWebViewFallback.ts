import { useSetAtom, useAtomValue } from 'jotai';
import { setProductAtom, setProductReviewAtom, productReviewAtom, productDetailAtom } from '@/stores/product/atoms';
import { CoupangCrawlAPI } from '@/stores/product/apis';
import { useState, useRef, useEffect } from 'react';
import { Product } from '@/stores/product/types';
import { TABS } from '@/utils/common';
import { logCrawlProcessResult } from '@/utils/crawlLog';

interface UseWebViewFallbackProps {
    productUrl: string;
    onComplete?: (data: { canLoadReport: boolean; canLoadReview: boolean; canLoadCaption: boolean }) => void;
    requestId: string;
}

export const useWebViewFallback = ({ productUrl, onComplete, requestId }: UseWebViewFallbackProps) => {
    const setProduct = useSetAtom(setProductAtom);
    const setProductReview = useSetAtom(setProductReviewAtom);
    const currentProductReview = useAtomValue(productReviewAtom);
    const currentProductDetail = useAtomValue(productDetailAtom);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const hasCalledRef = useRef(false);

    const startDate = useRef(new Date());

    // productUrl이 변경될 때 호출 상태 리셋
    useEffect(() => {
        hasCalledRef.current = false;
        setHasError(false);
        setIsLoading(false);
        startDate.current = new Date();
    }, [productUrl]);

    // 각 탭별로 필요한 데이터가 있는지 체크하는 함수 (useTabData.ts 참고)
    const checkTabRequirements = (tab: TABS, productDetail: any, productReview: string[]): boolean => {
        if (!productDetail) return false;

        switch (tab) {
            case TABS.CAPTION:
                return !!(productDetail.product?.name && productDetail.product?.thumbnail);
            case TABS.REPORT:
                return !!(
                    productDetail.product?.name &&
                    productDetail.product?.detail_images &&
                    productDetail.product.detail_images.length > 0
                );
            case TABS.REVIEW:
                return !!(productReview.length > 0 && productDetail.product?.name);
            default:
                return false;
        }
    };

    // 서버 크롤링 완료 후 각 탭의 데이터 존재 여부를 판단하는 함수
    const getTabDataStatus = (serverData: any) => {
        // 기존 데이터와 서버 데이터를 합친 가상의 productDetail 객체 생성
        const combinedProductDetail = {
            product: {
                ...currentProductDetail?.product,
                // 서버에서 새로 가져온 데이터로 업데이트 (모든 필드)
                name: serverData.name || currentProductDetail?.product?.name || '',
                price: serverData.price || currentProductDetail?.product?.price || 0,
                origin_price: serverData.origin_price || currentProductDetail?.product?.origin_price || 0,
                discount_rate: serverData.discount_rate || currentProductDetail?.product?.discount_rate || 0,
                ratings: serverData.ratings || currentProductDetail?.product?.ratings || 0,
                reviews: serverData.reviews_count || currentProductDetail?.product?.reviews || 0,
                thumbnail: serverData.thumbnail || currentProductDetail?.product?.thumbnail || '',
                detail_images: serverData.detail_images || currentProductDetail?.product?.detail_images || [],
                url: serverData.url || currentProductDetail?.product?.url || '',
                platform: serverData.platform || currentProductDetail?.product?.platform || 'coupang'
            }
        };

        // 기존 리뷰와 서버 리뷰를 합친 가상의 productReview 배열 생성
        const combinedProductReview = [...(currentProductReview.reviews || []), ...(serverData.reviews || [])];

        return {
            canLoadReport: checkTabRequirements(TABS.REPORT, combinedProductDetail, combinedProductReview),
            canLoadReview: checkTabRequirements(TABS.REVIEW, combinedProductDetail, combinedProductReview),
            canLoadCaption: checkTabRequirements(TABS.CAPTION, combinedProductDetail, combinedProductReview)
        };
    };

    // 에러 발생 시 기존 데이터만으로 각 탭의 데이터 존재 여부를 판단하는 함수
    const getTabDataStatusOnError = () => {
        return {
            canLoadReport: checkTabRequirements(TABS.REPORT, currentProductDetail, currentProductReview.reviews || []),
            canLoadReview: checkTabRequirements(TABS.REVIEW, currentProductDetail, currentProductReview.reviews || []),
            canLoadCaption: checkTabRequirements(TABS.CAPTION, currentProductDetail, currentProductReview.reviews || [])
        };
    };

    const handleWebViewError = async () => {
        // 이미 호출되었거나 로딩 중이거나 에러가 발생했거나 URL이 없으면 리턴
        if (hasCalledRef.current || isLoading || hasError || !productUrl) {
            return;
        }

        hasCalledRef.current = true;
        setIsLoading(true);
        setHasError(false);

        try {
            const response = await CoupangCrawlAPI(productUrl);

            const durationMs = new Date().getTime() - startDate.current.getTime();

            logCrawlProcessResult({
                requestId,
                productUrl,
                processType: 'server',
                success: true,
                durationMs,
                fields: {
                    name: !!response.data.data.name,
                    detail_images:
                        Array.isArray(response.data.data.detail_images) && response.data.data.detail_images.length > 0,
                    thumbnail: !!response.data.data.thumbnail,
                    reviews: Array.isArray(response.data.data.reviews) && response.data.data.reviews.length > 0
                }
            });

            if (response && response.data && response.data.success) {
                // 서버 응답에서 상품 정보 추출
                const serverData = response.data.data;

                console.log('서버 크롤링 데이터:', {
                    name: serverData.name,
                    price: serverData.price,
                    detail_images: serverData.detail_images?.length > 0 ? '있음' : '없음',
                    thumbnail: serverData.thumbnail || '',
                    reviews: serverData.reviews?.length > 0 ? '있음' : '없음'
                });

                if (serverData && serverData.name && serverData.price) {
                    // Product 타입에 맞게 변환
                    const productData: Partial<Product> = {
                        name: serverData.name,
                        price: serverData.price,
                        origin_price: serverData.origin_price || serverData.price,
                        discount_rate: serverData.discount_rate || 0,
                        ratings: serverData.ratings || 0,
                        reviews: serverData.reviews_count || 0,
                        thumbnail: serverData.thumbnail || '',
                        url: serverData.url || productUrl,
                        platform: 'coupang'
                    };

                    // detail_images가 있고 빈 배열이 아닐 때만 추가
                    if (serverData.detail_images && serverData.detail_images.length > 0) {
                        productData.detail_images = serverData.detail_images;
                    }

                    // Product 타입에 맞게 변환
                    const product: Product = productData as Product;

                    // 상품 정보를 atoms에 설정
                    setProduct(product);

                    // reviews가 있고 빈 배열이 아닐 때만 업데이트
                    if (serverData.reviews && serverData.reviews.length > 0) {
                        setProductReview(serverData.reviews);
                    }

                    console.log('서버 크롤링으로 상품 정보 업데이트 완료:', product.name);

                    // 완료 콜백 호출 - 각 탭의 요구사항에 따라 판단
                    const tabStatus = getTabDataStatus(serverData);

                    onComplete?.(tabStatus);
                } else {
                    console.error('서버 크롤링 결과에 필수 상품 정보가 없습니다');
                    setHasError(true);

                    // 에러가 발생해도 완료 콜백 호출 - 기존 데이터만으로 판단
                    const tabStatus = getTabDataStatusOnError();
                    onComplete?.(tabStatus);
                }
            } else {
                console.error('서버 크롤링 응답이 올바르지 않습니다');
                setHasError(true);

                // 에러가 발생해도 완료 콜백 호출 - 기존 데이터만으로 판단
                const tabStatus = getTabDataStatusOnError();
                onComplete?.(tabStatus);
            }
        } catch (error) {
            console.error('서버 크롤링 중 예외 발생:', error);
            setHasError(true);

            const durationMs = new Date().getTime() - startDate.current.getTime();

            logCrawlProcessResult({
                requestId,
                productUrl,
                processType: 'server',
                success: false,
                durationMs,
                fields: {
                    name: false,
                    detail_images: false,
                    thumbnail: false,
                    reviews: false
                }
            });

            // 에러가 발생해도 완료 콜백 호출 - 기존 데이터만으로 판단
            const tabStatus = getTabDataStatusOnError();
            onComplete?.(tabStatus);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleWebViewError,
        isLoading,
        hasError
    };
};
