import { atom } from 'jotai';
import { GetProductDetailRequest, SearchProductsRequest, SearchProductsResponse, DiscoverState, DiscoverDetailState, Product } from './types';
import { atomWithStorage } from '../utils';

import {
  GetProductDetailMainAPI,
  GetProductDetailsCaptionAPI,
  GetProductDetailsReviewAPI,
  GetProductDetailsReportAPI,
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
});
export const isSearchingAtom = atom(false);
export const searchResultAtom = atom<SearchProductsResponse | void>(undefined);

export const searchProductsAtom = atom(null, async (get, set, { onQuery, onLink, ...params }: SearchProductsRequest) => {
  set(isSearchingAtom, true);
  const {data: { product } } = await GetProductFromUrl({ url: params.query });
  if (product?.id !== undefined && onLink) {
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
    console.log(product.url, encodeURIComponent(product.url));
    onLink(`/discover-detail-main?productUrl=${encodeURIComponent(product.url)}`);
    set(isSearchingAtom, false);
    return;
  }
  if (params.page === 1) {
    set(searchResultAtom, undefined);
  }
  const { data } = await SearchProductsAPI(params);
  const searchResult = get(searchResultAtom);
  if (searchResult) {
    set(searchResultAtom, {
      ...data,
      products: searchResult.products.concat(data.products.map((item) => ({ ...item, platform: 'coupang-ict' }))),
    });
  } else {
    set(searchResultAtom, data);
  }
  onQuery?.();
  set(isSearchingAtom, false);
});

export const searchMoreAtom = atom(null, async (get, set, query: string) => {
  const searchResult = get(searchResultAtom);
  if (searchResult && searchResult.page < searchResult.last_page) {
    await set(searchProductsAtom, { query, page: searchResult.page + 1 });
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

export const getProductDetailAtom = atom(null, async (get, set, product: GetProductDetailRequest) => {
  const { data } = await GetProductDetailMainAPI(product)
  set(productDetailAtom, { ...data, id: `${data.product.id}` });
  set(loadingStatusAtom, { caption: LoadingStatus.LOADING, report: LoadingStatus.INIT, review: LoadingStatus.INIT });
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
  }
});

export const getProductDetailReviewAtom = atom(null, async (get, set, product: GetProductDetailRequest, reviews: string[]) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.LOADING });
  const { data: productDetail } = await GetProductDetailsReviewAPI(product, reviews)
  if (get(productDetailAtom)?.id?.toString() === product.id.toString()) {
    set(productDetailAtom, { id: `${product.id}`, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.FINISH });
  }
});

export const getProductDetailReportAtom = atom(null, async (get, set, product: GetProductDetailRequest, images: string[]) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), report: LoadingStatus.LOADING });
  const { data: productDetail } = await GetProductDetailsReportAPI(product, images)
  if (get(productDetailAtom)?.id?.toString() === product.id.toString()) {
    set(productDetailAtom, { id: `${product.id}`, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), report: LoadingStatus.FINISH });
  }
});

export const getProductDetailCaptionAtom = atom(null, async (get, set, product: GetProductDetailRequest) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.LOADING });
  const { data: productDetail } = await GetProductDetailsCaptionAPI(product)
  if (get(productDetailAtom)?.id?.toString() === product.id.toString()) {
    set(productDetailAtom, { id: `${product.id}`, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.FINISH });
  }
});

export const setProductLoadingStatusAtom = atom(null, async (get, set, { caption, review, report }: { caption?: LoadingStatus, review?: LoadingStatus, report?: LoadingStatus }) => {
  set(loadingStatusAtom, {
    caption: caption ?? get(loadingStatusAtom).caption,
    review: review ?? get(loadingStatusAtom).review,
    report: report ?? get(loadingStatusAtom).report,
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