import { atom } from 'jotai';
import { Alert } from 'react-native';
import { SearchProductsRequest, SearchProductsResponse, MainProductsState, GetProductDetailResponse, Product, ProductReview } from './types';
import { productGroupAtom } from '../log/atoms';
import { userDataAtom } from '../auth/atoms';
import { atomWithStorage,  } from '../utils';
import { deepEqual } from '../../utils/common';
import * as Haptics from 'expo-haptics';

import {
  GetMainProductsAPI,
  GetProductAPI,
  UpdateProductAPI,
  GetProductCaptionAPI,
  GetProductReportAPI,
  GetProductReviewAPI,
  GetProductAIAnswerAPI,
} from './apis';

export const mainProductsAtom = atom<MainProductsState>({
  special: [],
  random: [],
  local: [],
});

export enum LoadingStatus {
  INIT,
  LOADING,
  FINISH,
}

export const loadingStatusAtom = atom({
  caption: LoadingStatus.INIT,
  review: LoadingStatus.INIT,
  report: LoadingStatus.INIT,
  question: LoadingStatus.INIT,
});

export const isSearchingAtom = atom(false);

export const searchSorterAtom = atom('scoreDesc');

export const scrapedProductsAtom = atom<Product[]>([]);
export const scrapedProductsQueryAtom = atom<string>('');

export const setScrapedProductsAtom = atom(null, async (get, set, products: Product[], query: string) => {
  set(scrapedProductsAtom, products);
  set(scrapedProductsQueryAtom, query);
});

export const searchResultAtom = atom<SearchProductsResponse | void>(undefined);

export const searchProductsAtom = atom(null, async (get, set, { onQuery, onLink, ...params }: SearchProductsRequest) => {
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
          products: [productDetail?.product!],
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
      products,
    });

    onQuery?.();
  } catch (error) {
    console.error("Failed to fetch search results:", error);
    // 검색이 실패하면 빈 배열로 초기화
    set(searchResultAtom, { count: 0, page: 1, products: [] });
  } finally {
    set(isSearchingAtom, false);
  }
});

// 카테고리별 베스트 (random) + 오늘의 특가 상품 (special)
export const getMainProductsAtom = atom(null, async (get, set, categoryId: string) => {
  const response = await GetMainProductsAPI(categoryId);

  if (response && response.data) {
    set(mainProductsAtom, response.data);
  } else {
    // response가 void이거나 data가 없을 때 처리
    console.log('API로부터 데이터를 받지 못했습니다');
  }
});

export const productReviewAtom = atom<ProductReview>({reviews: []} as ProductReview);

export const setProductReviewAtom = atom(null, async (get, set, reviews: string[]) => {
  set(productReviewAtom, { reviews });
});

export const productDetailAtom = atom<GetProductDetailResponse | void>(undefined);

export const setProductAtom = atom(null, async (get, set, product: Product) => {
  const productDetail = get(productDetailAtom);
  
  if (productDetail?.product?.url === product.url) {
    // product가 다르면 업데이트 && 백엔드 db 업데이트 요청 (product 내 속성값이 모두 같은지 체크)
    if (!deepEqual(productDetail.product, product) && product.name && product.price) {
      set(productDetailAtom, { ...productDetail, product });
      // 백엔드 db 업데이트 요청
      await UpdateProductAPI({ product });
    }
  }
});

export const initProductDetailAtom = atom(null, async (get, set) => {
  set(productDetailAtom, { product: undefined } as GetProductDetailResponse);
  set(loadingStatusAtom, { caption: LoadingStatus.INIT, review: LoadingStatus.INIT, report: LoadingStatus.INIT, question: LoadingStatus.INIT });
});

export const getProductDetailAtom = atom(null, async (get, set, product: Product) => {
  const response = await GetProductAPI(product.url);
  if (response && response.data) {
    // db에 해당 url을 갖는 상품 정보 존재할 경우 해당 값으로 초기화
    set(productDetailAtom, response.data);
  } else {
    // 정보 없을 경우 일단 입력된 상품 정보로 초기화 (이후 setProductAtom에서 업데이트 진행)
    set(productDetailAtom, { product } as GetProductDetailResponse);
  }

  // 상품 캡션 생성 요청
  set(loadingStatusAtom, { caption: LoadingStatus.LOADING, report: LoadingStatus.INIT, review: LoadingStatus.INIT, question: LoadingStatus.INIT });
  const captionResponse = await GetProductCaptionAPI({ product });
  if (captionResponse && captionResponse.data && get(productDetailAtom)?.product?.url === product.url) {
    set(productDetailAtom, { ...get(productDetailAtom), ...captionResponse.data });
    set(loadingStatusAtom, { caption: LoadingStatus.FINISH, report: LoadingStatus.INIT, review: LoadingStatus.INIT, question: LoadingStatus.INIT });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  // if (get(productDetailAtom)?.url === product.url) {
  //   set(productDetailAtom, { url: product.url, ...get(productDetailAtom), ...productDetail });
  //   set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.FINISH });
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // }
});

// AI 리뷰 요약 정보 생성
export const getProductReviewAtom = atom(null, async (get, set) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.LOADING });
  const reviews = get(productReviewAtom).reviews;
  // 리뷰 없으면 생성 종료
  if (reviews.length === 0) {
    set(productDetailAtom, { ...get(productDetailAtom), review: { pros: [], cons: [], bests: [] } } as GetProductDetailResponse);
    set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.FINISH });
    return;
  }
  const product = get(productDetailAtom)?.product!;
  const response = await GetProductReviewAPI({ product, reviews });
  // 데이터가 존재하고, 현재 접속해있는 상품 페이지와 일치할 경우 업데이트
  if (response && response.data && get(productDetailAtom)?.product?.url === product.url) {
    set(productDetailAtom, { ...get(productDetailAtom), ...response.data });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.FINISH });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

// AI 상세페이지 설명 생성
export const getProductReportAtom = atom(null, async (get, set) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), report: LoadingStatus.LOADING });

  const product = get(productDetailAtom)?.product!;
  const response = await GetProductReportAPI({ product });
  // 데이터가 존재하고, 현재 접속해있는 상품 페이지와 일치할 경우 업데이트
  if (response && response.data && get(productDetailAtom)?.product?.url === product.url) {
    set(productDetailAtom, { ...get(productDetailAtom), ...response.data });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), report: LoadingStatus.FINISH });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

// AI 상품 이미지 설명 생성
export const getProductCaptionAtom = atom(null, async (get, set) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.LOADING });
  
  const product = get(productDetailAtom)?.product!;
  const response = await GetProductCaptionAPI({ product });
  // 데이터가 존재하고, 현재 접속해있는 상품 페이지와 일치할 경우 업데이트
  if (response && response.data && get(productDetailAtom)?.product?.url === product.url) {
    set(productDetailAtom, { ...get(productDetailAtom), ...response.data });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.FINISH });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

// AI 포미 답변 생성
export const getProductAIAnswerAtom = atom(null, async (get, set, question: string) => {
  // ai 답변 생성 후 aiPoint 차감
  const userData = await get(userDataAtom);
  if (!userData || userData.aiPoint < 1) {
    Alert.alert('AI 질문권 개수가 부족해요.');
    return;
  }
  set(userDataAtom, { ...userData!, aiPoint: userData!.aiPoint - 1});

  set(loadingStatusAtom, { ...get(loadingStatusAtom), question: LoadingStatus.LOADING });
  
  const product = get(productDetailAtom)?.product!;
  const reviews = get(productReviewAtom).reviews;
  const response = await GetProductAIAnswerAPI({ product, reviews, question });

  // 데이터가 존재하고, 현재 접속해있는 상품 페이지와 일치할 경우 업데이트
  if (response && response.data && get(productDetailAtom)?.product?.url === product.url) {
    set(productDetailAtom, { ...get(productDetailAtom), ...response.data });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), question: LoadingStatus.FINISH });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

export const setProductLoadingStatusAtom = atom(null, async (get, set, { caption, review, report, question }: { caption?: LoadingStatus, review?: LoadingStatus, report?: LoadingStatus, question?: LoadingStatus }) => {
  set(loadingStatusAtom, {
    caption: caption ?? get(loadingStatusAtom).caption,
    review: review ?? get(loadingStatusAtom).review,
    report: report ?? get(loadingStatusAtom).report,
    question: question ?? get(loadingStatusAtom).question,
  });
});

export const wishProductsAtom = atomWithStorage<Product[]>('wishlist2', []);

// export const clipboardProductAtom = atom<Product | void>(undefined);

// export const setClipboardProductAtom = atom(null, async (get, set, text: string) => {
//   if (!text) {
//     set(clipboardProductAtom, undefined);
//     return;
//   }
//   const { data: { platform, url } } = await ParseProductUrlAPI({ url: text });
//   if (!url) {
//     return;
//   }
//   const { data: { product } } = await GetProductAPI(url);
//   set(clipboardProductAtom, product);
//   set(searchResultAtom, {
//     count: 1,
//     page: 1,
//     products: [product],
//   });
// });



