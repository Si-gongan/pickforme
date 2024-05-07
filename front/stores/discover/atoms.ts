import { atom } from 'jotai';
import { GetProductDetailRequest, SearchProductsRequest, SearchProductsResponse, DiscoverState, DiscoverDetailState, Product, DetailedProduct } from './types';
import {
  GetProductDetailMainAPI,
  GetProductDetailsCaptionAPI,
  GetProductDetailsReviewAPI,
  GetProductDetailsReportAPI,
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

export const searchProductsAtom = atom(null, async (get, set, params: SearchProductsRequest) => {
  set(isSearchingAtom, true);
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
  set(isSearchingAtom, false);
});

export const searchMoreAtom = atom(null, async (get, set, query: string) => {
  const searchResult = get(searchResultAtom);
  if (searchResult && searchResult.page < searchResult.last_page) {
    await set(searchProductsAtom, { query, page: searchResult.page + 1 });
  }
});

export const getMainProductsAtom = atom(null, async (get, set) => {
  const { data } = await GetMainProductsAPI();
  set(mainProductsAtom, {
    ...data,
    special: data.special.map((item) => ({ ...item, id: item.productId })),
    random: data.random.map((item) => ({ ...item, id: item.productId })),
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
  const wishProducts = get(wishProductsAtom);
  set(wishProductsAtom, wishProducts.map((item) => item.id === data.product.id ? { ...item, ...data } : item));
  const { data: productDetail } = await GetProductDetailsCaptionAPI(product)
  if (get(productDetailAtom)?.id?.toString() === product.id.toString()) {
    set(productDetailAtom, { id: `${product.id}`, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), caption: LoadingStatus.FINISH });
  }
});

export const getProductDetailReviewAtom = atom(null, async (get, set, product: GetProductDetailRequest) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.LOADING });
  const { data: productDetail } = await GetProductDetailsReviewAPI(product)
  if (get(productDetailAtom)?.id?.toString() === product.id.toString()) {
    set(productDetailAtom, { id: `${product.id}`, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), review: LoadingStatus.FINISH });
  }
});

export const getProductDetailReportAtom = atom(null, async (get, set, product: GetProductDetailRequest) => {
  set(loadingStatusAtom, { ...get(loadingStatusAtom), report: LoadingStatus.LOADING });
  const { data: productDetail } = await GetProductDetailsReportAPI(product)
  if (get(productDetailAtom)?.id?.toString() === product.id.toString()) {
    set(productDetailAtom, { id: `${product.id}`, ...get(productDetailAtom), ...productDetail });
    set(loadingStatusAtom, { ...get(loadingStatusAtom), report: LoadingStatus.FINISH });
  }
});

export const wishProductsAtom = atom<(Product | DetailedProduct)[]>([]);
