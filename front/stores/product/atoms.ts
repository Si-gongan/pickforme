import { atom } from 'jotai';
import { SearchProductsRequest, SearchProductsResponse, MainProductsState, ProductDetailState, Product, ScrapedProductDetail } from './types';
import { productGroupAtom } from '../log/atoms';
import { userDataAtom } from '../auth/atoms';
import { atomWithStorage } from '../utils';
import * as Haptics from 'expo-haptics';

import {
  GetMainProductsAPI,
  GetProductAPI,
  GetProductCaptionAPI,
  GetProductReportAPI,
  GetProductReviewAPI,
  GetProductAIAnswerAPI,
  ParseProductUrlAPI,
  SearchProductsAPI
} from './apis';
import { Alert } from 'react-native';

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

export const searchResultAtom = atom<SearchProductsResponse | void>(undefined);

export const searchProductsAtom = atom(null, async (get, set, { onQuery, onLink, ...params }: SearchProductsRequest) => {
  set(isSearchingAtom, true);

  try {
    // query에 상품 url이 포함되었는지 판별
    const { data: { platform, url } } = await ParseProductUrlAPI({ url: params.query });

    if (url && onLink) { // query에 유효한 상품 url이 포함된 경우 바로 해당 상품 상세페이지로 이동
      const { data: { product } } = await GetProductAPI(url);
      set(productGroupAtom, 'link');
      set(searchResultAtom, {
        count: 1,
        page: 1,
        products: [product],
      });
      onLink(`/product-detail?productUrl=${encodeURIComponent(product.url)}`);
      set(isSearchingAtom, false);
      return;
    }

    // 일반 키워드 검색 결과 노출
    set(searchSorterAtom, params.sort);

    if (params.page === 1) {
      set(searchResultAtom, undefined);
    }
    const { data } = await SearchProductsAPI(params);

    const searchResult = get(searchResultAtom);
    if (searchResult) {
      set(searchResultAtom, {
        ...data,
        products: searchResult.products.concat(data.products),
      });
    } else {
      set(searchResultAtom, data);
    }
    onQuery?.();
  } catch (error) {
    console.error("Failed to fetch search results:", error);
    // 검색이 실패하면 빈 배열로 초기화
    set(searchResultAtom, { count: 0, page: 1, products: [] });
  } finally {
    set(isSearchingAtom, false);
  }
});

// export const getMainProductsAtom = atom(null, async (get, set, categoryId: string) => {
//   const { data } = await GetMainProductsAPI(categoryId);
//   set(mainProductsAtom, data);
// });
export const getMainProductsAtom = atom(null, async (get, set, categoryId: string) => {
  const response = await GetMainProductsAPI(categoryId);

  if (response && response.data) {
    set(mainProductsAtom, response.data);
  } else {
    // response가 void이거나 data가 없을 때 처리
    console.log(categoryId, 'API로부터 데이터를 받지 못했습니다');
  }
});

export const productDetailAtom = atom<ProductDetailState | void>(undefined);

export const initProductDetailAtom = atom(null, async (get, set) => {
  set(productDetailAtom, { product: undefined } as ProductDetailState);
  set(loadingStatusAtom, { caption: LoadingStatus.INIT, review: LoadingStatus.INIT, report: LoadingStatus.INIT, question: LoadingStatus.INIT });
});

export const getProductDetailAtom = atom(null, async (get, set, product: Product) => {
  const { data } = await GetProductAPI(product.url);
  set(productDetailAtom, { ...data, url: `${data.product.url}` });
  // caption (이미지 설명)은 바로 생성 시작
  set(loadingStatusAtom, { caption: LoadingStatus.LOADING, report: LoadingStatus.INIT, review: LoadingStatus.INIT, question: LoadingStatus.INIT });
  const { data: productDetail } = await GetProductCaptionAPI({ product })
  if (get(productDetailAtom)?.url === product.url) {
    set(productDetailAtom, { url: product.url, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.FINISH });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

export const getProductReviewAtom = atom(null, async (get, set, product: Product) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.LOADING });
  const reviews = get(scrapedProductDetailAtom).reviews!;
  if (reviews.length === 0) {
    set(productDetailAtom, { ...get(productDetailAtom), review: { pros: [], cons: [], bests: [] } } as ProductDetailState);
    set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.FINISH });
    return;
  }
  const { data: productDetail } = await GetProductReviewAPI({ product, reviews });
  if (get(productDetailAtom)?.url === product.url) {
    set(productDetailAtom, { url: product.url, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.FINISH });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

export const getProductReportAtom = atom(null, async (get, set, product: Product) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), report: LoadingStatus.LOADING });
  const images = get(scrapedProductDetailAtom).images!;
  // image length가 0이어도 그냥 진행
  const { data: productDetail } = await GetProductReportAPI({ product, images });
  if (get(productDetailAtom)?.url === product.url) {
    set(productDetailAtom, { url: product.url, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), report: LoadingStatus.FINISH });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

export const getProductCaptionAtom = atom(null, async (get, set, product: Product) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.LOADING });
  const { data: productDetail } = await GetProductCaptionAPI({ product });
  if (get(productDetailAtom)?.url === product.url) {
    set(productDetailAtom, { url: product.url, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.FINISH });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

export const getProductAIAnswerAtom = atom(null, async (get, set, product: Product, question: string) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), question: LoadingStatus.LOADING });
  const images = get(scrapedProductDetailAtom).images!;
  const reviews = get(scrapedProductDetailAtom).reviews!;
  const { data: productDetail } = await GetProductAIAnswerAPI({ product, images, reviews, question });

  // 추후 멤버십 로직 도입시 point 차감 로직 추가 (이벤트 기간 동안에는 무료)
  const userData = await get(userDataAtom);

  if (userData!.aiPoint < 1) {
    Alert.alert('AI 질문 횟수가 모두 차감되었어요!');
    // set(loadingStatusAtom, { ...get(loadingStatusAtom), question: LoadingStatus.FINISH }); // 초기화
    return;

  }
  // set(userDataAtom, { ...userData!, aiPoint: userData!.aiPoint - 1});

  if (get(productDetailAtom)?.url === product.url) {
    set(productDetailAtom, { url: product.url, ...get(productDetailAtom), ...productDetail });
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

export const clipboardProductAtom = atom<Product | void>(undefined);

export const setClipboardProductAtom = atom(null, async (get, set, text: string) => {
  if (!text) {
    set(clipboardProductAtom, undefined);
    return;
  }
  const { data: { platform, url } } = await ParseProductUrlAPI({ url: text });
  if (!url) {
    return;
  }
  const { data: { product } } = await GetProductAPI(url);
  set(clipboardProductAtom, product);
  set(searchResultAtom, {
    count: 1,
    page: 1,
    products: [product],
  });
});

export const scrapedProductDetailAtom = atom<ScrapedProductDetail>({
  images: [],
  reviews: [],
});

export const setScrapedProductDetailAtom = atom(null, async (get, set, { images, reviews }: ScrapedProductDetail) => {
  set(scrapedProductDetailAtom, { images: images ?? get(scrapedProductDetailAtom).images, reviews: reviews ?? get(scrapedProductDetailAtom).reviews });
});

