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
import { userAtom } from '@stores';
import { atomWithStorage } from '../utils';
import * as Haptics from 'expo-haptics';
import { attempt } from '../../utils/axios';

import {
    GetMainProductsAPI,
    GetProductAPI,
    GetProductCaptionAPI,
    GetProductReportAPI,
    GetProductReviewAPI,
    GetProductAIAnswerAPI,
    ParseProductUrlAPI,
    UpdateProductAPI
} from './apis';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { resolveRedirectUrl, sanitizeUrl, normalizeUrl } from '../../utils/url';

export const mainProductsAtom = atom<MainProductsState>({
    special: [],
    random: [],
    local: []
});

export enum LoadingStatus {
    INIT,
    LOADING,
    FINISH,
    ERROR
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
export const setScrapedProductsAtom = atom(null, async (get, set, products: Product[], query: string) => {
    set(scrapedProductsAtom, products);
    set(scrapedProductsQueryAtom, query);
});

export const searchProductsAtom = atom(
    null,
    async (get, set, { onQuery, onLink, ...params }: SearchProductsRequest) => {
        set(isSearchingAtom, true);

        try {
            // query에 상품 url이 포함되었는지 판별
            let productUrl = params.query;
            productUrl = await resolveRedirectUrl(sanitizeUrl(productUrl));
            productUrl = normalizeUrl(productUrl);

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

                // 로그 관련 코드 제거
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
    const result = await attempt(() => GetMainProductsAPI(categoryId));

    if (!result.ok) {
        console.error('상품 목록 가져오기 실패:', result.error);
        return;
    }

    const response = result.value;
    if (response && response.data) {
        set(mainProductsAtom, response.data);
    } else {
        console.log(categoryId, 'API로부터 데이터를 받지 못했습니다');
    }
});

export const productDetailAtom = atom<ProductDetailState | undefined>(undefined);

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
    const productDetail = get(productDetailAtom);

    // URL이 일치하지 않아도 상품 정보 업데이트
    if (product.name && product.price) {
        set(productDetailAtom, {
            ...productDetail,
            url: product.url,
            product: {
                ...productDetail?.product, // 기존 product의 정보 유지 (caption 등)
                ...product // 새로운 정보로 업데이트
            }
        });

        // 캡션이 존재하면 loadingStatus도 업데이트 필요 : 2025.04.09
        if (productDetail?.caption) {
            set(loadingStatusAtom, {
                ...get(loadingStatusAtom),
                caption: LoadingStatus.FINISH
            });
        }

        // 백엔드 db 업데이트 요청

        const result = await attempt(() => UpdateProductAPI({ product }));
        if (!result.ok) console.error('백엔드 업데이트 API 호출 실패:', result.error);
    } else {
        console.error('필수 데이터 누락:', {
            hasName: !!product.name,
            hasPrice: !!product.price
        });
    }
});

// main 브랜치 코드 : 이거 쓰면 main product 목록 가져올때 timeout 에러 발생함
// export const setProductAtom = atom(null, async (get, set, product: Product) => {
//     const productDetail = get(productDetailAtom);

//     if (productDetail?.product?.url === product.url) {
//         // product가 다르면 업데이트 && 백엔드 db 업데이트 요청 (product 내 속성값이 모두 같은지 체크)
//         if (!deepEqual(productDetail.product, product) && product.name && product.price) {
//             set(productDetailAtom, { ...productDetail, product });
//             // 백엔드 db 업데이트 요청
//             await UpdateProductAPI({ product });
//         }
//     }
// });

export const productReviewAtom = atom<ProductReview>({ reviews: [] } as ProductReview);

export const setProductReviewAtom = atom(null, async (get, set, reviews: string[]) => {
    set(productReviewAtom, { reviews });
});

export const getProductDetailAtom = atom(null, async (get, set, product: Product) => {
    const result = await attempt(() => GetProductAPI(product.url));

    if (!result.ok) {
        console.error('상품 정보 가져오기 실패:', result.error);
        // 정보 없을 경우 일단 입력된 상품 정보로 초기화
        set(productDetailAtom, { product, url: product.url } as ProductDetailState);
    } else {
        const response = result.value;
        if (response && response.data) {
            // db에 해당 url을 갖는 상품 정보 존재할 경우 해당 값으로 초기화
            set(productDetailAtom, { ...response.data, url: product.url });
        } else {
            // 정보 없을 경우 일단 입력된 상품 정보로 초기화
            set(productDetailAtom, { product, url: product.url } as ProductDetailState);
        }
    }
});

// AI 리뷰 요약 정보 생성
export const getProductReviewAtom = atom(null, async (get, set) => {
    set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.LOADING });
    const reviews = get(productReviewAtom).reviews;

    if (reviews.length === 0) {
        set(productDetailAtom, {
            ...get(productDetailAtom),
            review: { pros: [], cons: [], bests: [] },
            url: get(productDetailAtom)?.product?.url as string
        } as ProductDetailState);
    }
    const product = get(productDetailAtom)?.product!;

    const result = await attempt(() => GetProductReviewAPI({ product, reviews }));

    if (!result.ok) {
        console.error('리뷰 요약 생성 실패:', result.error);
        set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.ERROR });
        return;
    }

    const response = result.value;

    // 데이터가 존재하고, 현재 접속해있는 상품 페이지와 일치할 경우 업데이트
    if (response && response.data && get(productDetailAtom)?.product?.url === product.url) {
        set(productDetailAtom, { ...get(productDetailAtom), ...response.data, url: product.url as string });
        set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.FINISH });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
});

// AI 상세페이지 설명 생성
export const getProductReportAtom = atom(null, async (get, set) => {
    set(loadingStatusAtom, {
        ...get(loadingStatusAtom),
        report: LoadingStatus.LOADING
    });

    const product = get(productDetailAtom)?.product!;

    const result = await attempt(() => GetProductReportAPI({ product }));

    if (!result.ok) {
        console.error('상세 설명 생성 실패:', result.error);
        set(loadingStatusAtom, { ...get(loadingStatusAtom), report: LoadingStatus.ERROR });
        return;
    }

    const response = result.value;
    // 데이터가 존재하고, 현재 접속해있는 상품 페이지와 일치할 경우 업데이트
    if (response && response.data && get(productDetailAtom)?.product?.url === product.url) {
        set(productDetailAtom, { ...get(productDetailAtom), ...response.data, url: product.url as string });
        set(loadingStatusAtom, {
            ...get(loadingStatusAtom),
            report: LoadingStatus.FINISH
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
});

// AI 상품 이미지 설명 생성
export const getProductCaptionAtom = atom(null, async (get, set) => {
    set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.LOADING });

    const product = get(productDetailAtom)?.product!;

    const result = await attempt(() => GetProductCaptionAPI({ product }));

    if (!result.ok) {
        console.error('이미지 설명 생성 실패:', result.error);
        set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.ERROR });
        return;
    }

    const response = result.value;

    // 데이터가 존재하고, 현재 접속해있는 상품 페이지와 일치할 경우 업데이트
    if (response && response.data && get(productDetailAtom)?.product?.url === product.url) {
        set(productDetailAtom, { ...get(productDetailAtom), ...response.data, url: product.url as string });
        set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.FINISH });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
});

// AI 포미 답변 생성
export const getProductAIAnswerAtom = atom(null, async (get, set, question: string) => {
    // ai 답변 생성 후 aiPoint 차감
    const userData = await get(userAtom);
    if (!userData || typeof userData.aiPoint === 'undefined' || userData.aiPoint < 1) {
        Alert.alert('AI 질문권 개수가 부족해요.');
        return;
    }
    set(userAtom, { ...userData, aiPoint: userData.aiPoint - 1 });

    set(loadingStatusAtom, { ...get(loadingStatusAtom), question: LoadingStatus.LOADING });

    const product = get(productDetailAtom)?.product!;
    const reviews = get(productReviewAtom).reviews;

    const result = await attempt(() => GetProductAIAnswerAPI({ product, reviews, question }));

    if (!result.ok) {
        console.error('AI 답변 생성 실패:', result.error);
        set(loadingStatusAtom, { ...get(loadingStatusAtom), question: LoadingStatus.ERROR });
        return;
    }

    const response = result.value;

    // 데이터가 존재하고, 현재 접속해있는 상품 페이지와 일치할 경우 업데이트
    if (response && response.data && get(productDetailAtom)?.product?.url === product.url) {
        set(productDetailAtom, {
            ...get(productDetailAtom),
            ...response.data,
            url: product.url as string // 명시적으로 string 타입의 url 할당
        });
        set(loadingStatusAtom, { ...get(loadingStatusAtom), question: LoadingStatus.FINISH });
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

    const parseResult = await attempt(() => ParseProductUrlAPI({ url: text }));

    if (!parseResult.ok) {
        console.error('URL 파싱 실패:', parseResult.error);
        return;
    }

    const { platform, url } = parseResult.value.data;

    if (!url) {
        return;
    }

    const productResult = await attempt(() => GetProductAPI(url));

    if (!productResult.ok) {
        console.error('상품 정보 가져오기 실패:', productResult.error);
        return;
    }

    const { product } = productResult.value.data;

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
