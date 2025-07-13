import { useSetAtom } from 'jotai';
import { setProductAtom, setProductReviewAtom } from '@/stores/product/atoms';
import { CoupangCrawlAPI } from '@/stores/product/apis';
import { useState, useRef, useEffect } from 'react';
import { Product } from '@/stores/product/types';

interface UseWebViewFallbackProps {
    productUrl: string;
}

export const useWebViewFallback = ({ productUrl }: UseWebViewFallbackProps) => {
    const setProduct = useSetAtom(setProductAtom);
    const setProductReview = useSetAtom(setProductReviewAtom);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const hasCalledRef = useRef(false);

    // productUrl이 변경될 때 호출 상태 리셋
    useEffect(() => {
        hasCalledRef.current = false;
        setHasError(false);
        setIsLoading(false);
    }, [productUrl]);

    const handleWebViewError = async () => {
        // 이미 호출되었거나 로딩 중이거나 에러가 발생했거나 URL이 없으면 리턴
        if (hasCalledRef.current || isLoading || hasError || !productUrl) {
            console.log('handleWebViewError 호출 무시:', {
                hasCalled: hasCalledRef.current,
                isLoading,
                hasError,
                hasUrl: !!productUrl
            });
            return;
        }

        hasCalledRef.current = true;
        setIsLoading(true);
        setHasError(false);

        try {
            const response = await CoupangCrawlAPI(productUrl);

            if (response && response.data && response.data.success) {
                // 서버 응답에서 상품 정보 추출
                const serverData = response.data.data;

                console.log('get data from server', serverData);

                if (serverData && serverData.name && serverData.price) {
                    // Product 타입에 맞게 변환
                    const product: Product = {
                        name: serverData.name,
                        price: serverData.price,
                        origin_price: serverData.origin_price || serverData.price,
                        discount_rate: serverData.discount_rate || 0,
                        ratings: serverData.ratings || 0,
                        reviews: serverData.reviews_count || 0,
                        thumbnail: serverData.thumbnail || '',
                        detail_images: serverData.detail_images || [],
                        url: serverData.url || productUrl,
                        platform: 'coupang'
                    };

                    // 상품 정보를 atoms에 설정
                    setProduct(product);

                    if (serverData.reviews) {
                        setProductReview(serverData.reviews);
                    }

                    console.log('서버 크롤링으로 상품 정보 업데이트 완료:', product.name);
                } else {
                    console.error('서버 크롤링 결과에 필수 상품 정보가 없습니다');
                    setHasError(true);
                }
            } else {
                console.error('서버 크롤링 응답이 올바르지 않습니다');
                setHasError(true);
            }
        } catch (error) {
            console.error('서버 크롤링 중 예외 발생:', error);
            setHasError(true);
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
