import { atom } from 'jotai';
import {
    SearchProductsRequest,
    SearchProductsResponse,
    MainProductsState,
    ProductDetailState,
    Product,
    ScrapedProductDetail,
    GetProductDetailResponse,
    ProductReview
} from './types';
import { productGroupAtom } from '../log/atoms';
import { userDataAtom } from '../auth/atoms';
import { atomWithStorage } from '../utils';
import * as Haptics from 'expo-haptics';
import { deepEqual } from '../../utils/common';

import {
    GetMainProductsAPI,
    GetProductAPI,
    GetProductCaptionAPI,
    GetProductReportAPI,
    GetProductReviewAPI,
    GetProductAIAnswerAPI,
    ParseProductUrlAPI,
    SearchProductsAPI,
    UpdateProductAPI
} from './apis';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export const mainProductsAtom = atom<MainProductsState>({
    special: [],
    random: [],
    local: []
});

export enum LoadingStatus {
    INIT,
    LOADING,
    FINISH
}

export const loadingStatusAtom = atom({
    caption: LoadingStatus.INIT,
    review: LoadingStatus.INIT,
    report: LoadingStatus.INIT,
    question: LoadingStatus.INIT
});

export const isSearchingAtom = atom(false);

export const searchSorterAtom = atom('scoreDesc');

export const searchResultAtom = atom<SearchProductsResponse | void>(undefined);

export const scrapedProductsAtom = atom<Product[]>([]);
export const scrapedProductsQueryAtom = atom<string>('');

export const searchProductsAtom = atom(
    null,
    async (get, set, { onQuery, onLink, ...params }: SearchProductsRequest) => {
        set(isSearchingAtom, true);

        try {
            // query에 상품 url이 포함되었는지 판별
            const productUrl = params.query;

            // query에 유효한 상품 url이 포함된 경우 바로 해당 상품 상세페이지로 이동
            if (productUrl.includes('http') && onLink) {
                // coupang 외 link는 일단 제외
                if (!productUrl.includes('coupang')) {
                    // console.log('Not coupang link:', productUrl);
                    set(searchResultAtom, { count: 0, page: 1, products: [] });
                    onQuery?.();
                    // await new Promise(resolve => setTimeout(resolve, 1000));
                    set(isSearchingAtom, false);
                    return;
                }

                set(productGroupAtom, 'link');
                onLink(`/product-detail?productUrl=${encodeURIComponent(productUrl)}`);

                const maxTries = 5;
                let tries = 0;
                let productDetail: GetProductDetailResponse | void = undefined;
                let successFlag = false;

                while (tries < maxTries) {
                    productDetail = get(productDetailAtom);
                    if (productDetail?.product?.url === productUrl) {
                        successFlag = true;
                        break;
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        tries++;
                    }
                }

                if (successFlag) {
                    set(searchResultAtom, {
                        count: 1,
                        page: 1,
                        products: [productDetail?.product!]
                    });
                } else {
                    set(searchResultAtom, { count: 0, page: 1, products: [] });
                }

                set(isSearchingAtom, false);
                return;
            }

            // query에 상품 url 포함 안 된 경우 일반 키워드 검색 결과 노출
            set(searchSorterAtom, params.sort);

            if (params.page === 1) {
                set(searchResultAtom, undefined);
            }
            // const { data } = await SearchProductsAPI(params);
            const maxTries = 5;
            let tries = 0;
            let products: Product[] = [];
            let query = '';

            while (tries < maxTries) {
                products = get(scrapedProductsAtom);
                query = get(scrapedProductsQueryAtom);
                if (products.length > 0 && query === params.query) {
                    break;
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    tries++;
                }
            }
            // TODO: deeplink 변환 로직 추가
            set(searchResultAtom, {
                count: products.length,
                page: 1,
                products
            });

            onQuery?.();
        } catch (error) {
            console.error('Failed to fetch search results:', error);
            // 검색이 실패하면 빈 배열로 초기화
            set(searchResultAtom, { count: 0, page: 1, products: [] });
        } finally {
            set(isSearchingAtom, false);
        }
    }
);

export const getMainProductsAtom = atom(null, async (get, set, categoryId: string) => {
    const response = await GetMainProductsAPI(categoryId);

    if (response && response.data) {
        set(mainProductsAtom, response.data);
    } else {
        console.log(categoryId, 'API로부터 데이터를 받지 못했습니다');
    }
});

export const productDetailAtom = atom<ProductDetailState | void>(undefined);

export const initProductDetailAtom = atom(null, async (get, set) => {
    set(productDetailAtom, { product: undefined } as ProductDetailState);
    set(loadingStatusAtom, {
        caption: LoadingStatus.INIT,
        review: LoadingStatus.INIT,
        report: LoadingStatus.INIT,
        question: LoadingStatus.INIT
    });
});

export const setProductAtom = atom(null, async (get, set, product: Product) => {
    console.log('setProductAtom 호출됨:', {
        productUrl: product.url,
        productName: product.name,
        productPrice: product.price
    });

    const productDetail = get(productDetailAtom);
    console.log('현재 productDetail 상태:', productDetail);

    // URL이 일치하지 않아도 상품 정보 업데이트
    if (product.name && product.price) {
        console.log('상품 정보 업데이트 시작:', {
            before: productDetail?.product,
            after: product
        });

        set(productDetailAtom, {
            ...productDetail,
            url: product.url,
            product
        });
        console.log('productDetail 상태 업데이트 완료');

        // 백엔드 db 업데이트 요청
        try {
            console.log('백엔드 업데이트 API 호출 시작');
            await UpdateProductAPI({ product });
            console.log('백엔드 업데이트 API 호출 완료');
        } catch (error) {
            console.error('백엔드 업데이트 API 호출 실패:', error);
        }
    } else {
        console.log('필수 데이터 누락:', {
            hasName: !!product.name,
            hasPrice: !!product.price
        });
    }
});
export const productReviewAtom = atom<ProductReview>({ reviews: [] } as ProductReview);

export const setProductReviewAtom = atom(null, async (get, set, reviews: string[]) => {
    console.log('setProductReviewAtom 호출됨:', {
        reviewsCount: reviews.length,
        reviews: reviews.slice(0, 2) // 처음 2개만 로깅
    });

    const currentState = get(productReviewAtom);
    console.log('현재 productReview 상태:', currentState);

    set(productReviewAtom, { reviews });
    // loadingStatusAtom 업데이트
    set(loadingStatusAtom, {
        ...get(loadingStatusAtom),
        review: LoadingStatus.FINISH
    });
    console.log('productReview 상태 업데이트 완료');
});

export const getProductDetailAtom = atom(null, async (get, set, product: Product) => {
    console.log('getProductDetailAtom 시작:', { productUrl: product.url });

    try {
        const response = await GetProductAPI(product.url);
        console.log('GetProductAPI 응답:', response.data, response.status);

        // 빈 응답이 오면, 캐시가 비어있다는 의미이므로 종료
        if (!response.data || response.status === 204) {
            console.log('캐시없음:', get(productDetailAtom));
            return;
        }

        const newState = { ...response.data, url: product.url } as ProductDetailState;
        console.log('상품 상세 정보 설정:', newState);
        set(productDetailAtom, newState);
        console.log('설정 후 상태:', get(productDetailAtom));

        // 상품 캡션 생성 요청
        set(loadingStatusAtom, {
            caption: LoadingStatus.LOADING,
            report: LoadingStatus.INIT,
            review: LoadingStatus.INIT,
            question: LoadingStatus.INIT
        });

        const captionResponse = await GetProductCaptionAPI({ product });
        console.log('캡션 API 응답:', captionResponse);

        if (captionResponse && captionResponse.data && get(productDetailAtom)?.product?.url === product.url) {
            const currentState = get(productDetailAtom);
            console.log('현재 상태:', currentState);
            const updatedState = { ...currentState, ...captionResponse.data, url: product.url };
            console.log('캡션 데이터 업데이트:', updatedState);

            set(productDetailAtom, updatedState);
            set(loadingStatusAtom, {
                ...get(loadingStatusAtom),
                caption: LoadingStatus.FINISH
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
            console.log('캡션 업데이트 조건 불일치:', {
                hasCaptionResponse: !!captionResponse,
                hasData: !!captionResponse?.data,
                currentUrl: get(productDetailAtom)?.product?.url,
                productUrl: product.url
            });
        }
    } catch (error) {
        console.error('GetProductAPI 에러:', error);
        const errorState = {
            product: product,
            url: product.url
        } as ProductDetailState;
        console.log('에러 발생 시 기본 상품 정보 설정:', errorState);
        set(productDetailAtom, errorState);
        console.log('설정 후 상태:', get(productDetailAtom));
    }
});

export const getProductReviewAtom = atom(null, async (get, set, product: Product) => {
    set(loadingStatusAtom, {
        ...get(loadingStatusAtom),
        review: LoadingStatus.LOADING
    });
    const reviews = get(scrapedProductDetailAtom).reviews!;
    if (reviews.length === 0) {
        set(productDetailAtom, {
            ...get(productDetailAtom),
            review: { pros: [], cons: [], bests: [] }
        } as ProductDetailState);
        set(loadingStatusAtom, {
            ...get(loadingStatusAtom),
            review: LoadingStatus.FINISH
        });
        return;
    }
    const { data: productDetail } = await GetProductReviewAPI({
        product,
        reviews
    });
    if (get(productDetailAtom)?.url === product.url) {
        set(productDetailAtom, {
            url: product.url,
            ...get(productDetailAtom),
            ...productDetail
        });
        set(loadingStatusAtom, {
            ...get(loadingStatusAtom),
            review: LoadingStatus.FINISH
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
});

export const getProductReportAtom = atom(null, async (get, set, product: Product) => {
    set(loadingStatusAtom, {
        ...get(loadingStatusAtom),
        report: LoadingStatus.LOADING
    });
    const images = get(scrapedProductDetailAtom).images!;
    // image length가 0이어도 그냥 진행
    const { data: productDetail } = await GetProductReportAPI({
        product,
        images
    });
    if (get(productDetailAtom)?.url === product.url) {
        set(productDetailAtom, {
            url: product.url,
            ...get(productDetailAtom),
            ...productDetail
        });
        set(loadingStatusAtom, {
            ...get(loadingStatusAtom),
            report: LoadingStatus.FINISH
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
});

export const getProductCaptionAtom = atom(null, async (get, set, product: Product) => {
    set(loadingStatusAtom, {
        ...get(loadingStatusAtom),
        caption: LoadingStatus.LOADING
    });
    const { data: productDetail } = await GetProductCaptionAPI({ product });
    if (get(productDetailAtom)?.url === product.url) {
        set(productDetailAtom, {
            url: product.url,
            ...get(productDetailAtom),
            ...productDetail
        });
        set(loadingStatusAtom, {
            ...get(loadingStatusAtom),
            caption: LoadingStatus.FINISH
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
});

export const getProductAIAnswerAtom = atom(null, async (get, set, product: Product, question: string) => {
    set(loadingStatusAtom, {
        ...get(loadingStatusAtom),
        question: LoadingStatus.LOADING
    });
    const images = get(scrapedProductDetailAtom).images!;
    const reviews = get(scrapedProductDetailAtom).reviews!;
    const { data: productDetail } = await GetProductAIAnswerAPI({
        product,
        images,
        reviews,
        question
    });

    // 추후 멤버십 로직 도입시 point 차감 로직 추가 (이벤트 기간 동안에는 무료)
    const userData = await get(userDataAtom);

    if (userData!.aiPoint < 1) {
        Alert.alert('AI 질문 횟수가 모두 차감되었어요!');
        // set(loadingStatusAtom, { ...get(loadingStatusAtom), question: LoadingStatus.FINISH }); // 초기화
        return;
    }
    // set(userDataAtom, { ...userData!, aiPoint: userData!.aiPoint - 1});

    if (get(productDetailAtom)?.url === product.url) {
        set(productDetailAtom, {
            url: product.url,
            ...get(productDetailAtom),
            ...productDetail
        });
        set(loadingStatusAtom, {
            ...get(loadingStatusAtom),
            question: LoadingStatus.FINISH
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
});

export const setProductLoadingStatusAtom = atom(
    null,
    async (
        get,
        set,
        {
            caption,
            review,
            report,
            question
        }: {
            caption?: LoadingStatus;
            review?: LoadingStatus;
            report?: LoadingStatus;
            question?: LoadingStatus;
        }
    ) => {
        set(loadingStatusAtom, {
            caption: caption ?? get(loadingStatusAtom).caption,
            review: review ?? get(loadingStatusAtom).review,
            report: report ?? get(loadingStatusAtom).report,
            question: question ?? get(loadingStatusAtom).question
        });
    }
);

export const wishProductsAtom = atomWithStorage<Product[]>('wishlist2', []);

export const clipboardProductAtom = atom<Product | void>(undefined);

export const setClipboardProductAtom = atom(null, async (get, set, text: string) => {
    if (!text) {
        set(clipboardProductAtom, undefined);
        return;
    }
    const {
        data: { platform, url }
    } = await ParseProductUrlAPI({ url: text });
    if (!url) {
        return;
    }
    const {
        data: { product }
    } = await GetProductAPI(url);
    set(clipboardProductAtom, product);
    set(searchResultAtom, {
        count: 1,
        page: 1,
        products: [product]
    });
});

export const scrapedProductDetailAtom = atom<ScrapedProductDetail>({
    images: [],
    reviews: []
});

export const setScrapedProductDetailAtom = atom(null, async (get, set, { images, reviews }: ScrapedProductDetail) => {
    set(scrapedProductDetailAtom, {
        images: images ?? get(scrapedProductDetailAtom).images,
        reviews: reviews ?? get(scrapedProductDetailAtom).reviews
    });
});

export const openCoupangLink = async (coupangUrl: string, webUrl: string) => {
    try {
        await WebBrowser.openBrowserAsync(coupangUrl);
    } catch {
        // 앱이 없으면 웹 브라우저로 열기 (에러 로깅 없이)
        await WebBrowser.openBrowserAsync(webUrl);
    }
};
