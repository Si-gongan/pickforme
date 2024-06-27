import { atom } from 'jotai';
import { GetProductDetailRequest, SearchProductsRequest, SearchProductsResponse, DiscoverState, DiscoverDetailState, Product, ScrapedProductDetail } from './types';
import { productGroupAtom } from '../log/atoms';
import { atomWithStorage } from '../utils';
import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

import {
  GetProductDetailMainAPI,
  GetProductDetailsCaptionAPI,
  GetProductDetailsReviewAPI,
  GetProductDetailsReportAPI,
  GetProductDetailsAIAnswerAPI,
  GetProductFromUrl,
GetMainProductsAPI, SearchProductsAPI } from './apis';

export const mainProductsAtom = atom<DiscoverState>({
  special: [],
  random: [],
  reports: [],
  local: [],
});

enum LoadingStatus {
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
  const {data: { product } } = await GetProductFromUrl({ url: params.query });
  if (product?.id !== undefined && onLink) {
    set(clipboardProductAtom, product);
    if (!get(searchResultAtom)?.products.length) {
      set(productGroupAtom, 'link');
      set(searchResultAtom, {
        total: 1,
        count: 1,
        per_page: 1,
        page: 1,
        last_page: 1,
        products: [product],
      });
    }
    onLink(`/discover-detail-main?productUrl=${encodeURIComponent(product.url)}`);
    set(isSearchingAtom, false);
    return;
  }

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
  set(isSearchingAtom, false);
});

export const searchMoreAtom = atom(null, async (get, set, query: string) => {
  const searchResult = get(searchResultAtom);
  const sort = get(searchSorterAtom);
  if (searchResult && searchResult.page < searchResult.last_page) {
    await set(searchProductsAtom, { query, page: searchResult.page + 1, sort });
  }
});

export const getMainProductsAtom = atom(null, async (get, set, categoryId: string) => {
  const { data } = await GetMainProductsAPI(categoryId);
  set(mainProductsAtom, {
    ...data,
    special: data.special.map((item) => ({ ...item, id: item.id })),
    random: data.random.map((item) => ({ ...item, id: item.id })),
  });
});
export const productDetailAtom = atom<DiscoverDetailState | void>(undefined);

export const initProductDetailAtom = atom(null, async (get, set) => {
  set(productDetailAtom, { product: undefined } as DiscoverDetailState);
  set(loadingStatusAtom, { caption: LoadingStatus.INIT, review: LoadingStatus.INIT, report: LoadingStatus.INIT, question: LoadingStatus.INIT});
});

export const getProductDetailAtom = atom(null, async (get, set, product: GetProductDetailRequest) => {
  const { data } = await GetProductDetailMainAPI(product)
  set(productDetailAtom, { ...data, id: `${data.product.id}` });
  set(loadingStatusAtom, { caption: LoadingStatus.LOADING, report: LoadingStatus.INIT, review: LoadingStatus.INIT, question: LoadingStatus.INIT });
  const searchResult = get(searchResultAtom);
  if (searchResult) {
    set(searchResultAtom, {
      ...searchResult,
      products: searchResult.products.map((item) => item.id === data.product.id ? { ...item, ...data } : item),
    });
  }
  const wishProducts = await get(wishProductsAtom);
  set(wishProductsAtom, wishProducts.map((item) => item.id === data.product.id ? { ...item, ...data } : item));
  const { data: productDetail } = await GetProductDetailsCaptionAPI(product)
  if (get(productDetailAtom)?.id?.toString() === product.id.toString()) {
    set(productDetailAtom, { id: `${product.id}`, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.FINISH });
    AccessibilityInfo.announceForAccessibility('상품의 이미지 설명 생성이 완료되었어요.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

export const getProductDetailReviewAtom = atom(null, async (get, set, product: GetProductDetailRequest) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.LOADING });
  const reviews = get(scrapedProductDetailAtom).reviews!;
  const { data: productDetail } = await GetProductDetailsReviewAPI(product, reviews)
  if (get(productDetailAtom)?.id?.toString() === product.id.toString()) {
    set(productDetailAtom, { id: `${product.id}`, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.FINISH });
    AccessibilityInfo.announceForAccessibility('상품의 리뷰 요약이 완료되었어요.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

export const getProductDetailReportAtom = atom(null, async (get, set, product: GetProductDetailRequest) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), report: LoadingStatus.LOADING });
  const images = get(scrapedProductDetailAtom).images!;
  const { data: productDetail } = await GetProductDetailsReportAPI(product, images)
  if (get(productDetailAtom)?.id?.toString() === product.id.toString()) {
    set(productDetailAtom, { id: `${product.id}`, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), report: LoadingStatus.FINISH });
    AccessibilityInfo.announceForAccessibility('상품의 상세페이지 설명 생성이 완료되었어요.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

export const getProductDetailCaptionAtom = atom(null, async (get, set, product: GetProductDetailRequest) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.LOADING });
  const { data: productDetail } = await GetProductDetailsCaptionAPI(product)
  if (get(productDetailAtom)?.id?.toString() === product.id.toString()) {
    set(productDetailAtom, { id: `${product.id}`, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.FINISH });
    AccessibilityInfo.announceForAccessibility('상품의 이미지 설명 생성이 완료되었어요.');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
});

export const getProductDetailAIAnswerAtom = atom(null, async (get, set, product: GetProductDetailRequest, question: string) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), question: LoadingStatus.LOADING });
  const images = get(scrapedProductDetailAtom).images!;
  const reviews = get(scrapedProductDetailAtom).reviews!;
  const { data: productDetail } = await GetProductDetailsAIAnswerAPI(product, images, reviews, question)
  if (get(productDetailAtom)?.id?.toString() === product.id.toString()) {
    set(productDetailAtom, { id: `${product.id}`, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), question: LoadingStatus.FINISH });
    AccessibilityInfo.announceForAccessibility('AI 포미의 답변 생성이 완료되었어요.');
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

export const setClipboardProductAtom = atom(null, async (get,set, text: string) => {
  if (!text) {
    set(clipboardProductAtom, undefined);
    return;
  }
  const {data: { product } } = await GetProductFromUrl({ url: text });
  if (!product) {
    return;
  }
  set(clipboardProductAtom, product);
  if (!get(searchResultAtom)?.products.length) {
    set(searchResultAtom, {
      total: 1,
      count: 1,
      per_page: 1,
      page: 1,
      last_page: 1,
      products: [product],
    });
  }
});

export const scrapedProductDetailAtom = atom<ScrapedProductDetail>({
  images: [],
  reviews: [],
});

export const setScrapedProductDetailAtom = atom(null, async (get, set, { images, reviews }: ScrapedProductDetail) => {
  set(scrapedProductDetailAtom, { images: images ?? get(scrapedProductDetailAtom).images, reviews: reviews ?? get(scrapedProductDetailAtom).reviews });
});

