import { atom } from 'jotai';
import { GetProductDetailRequest, SearchProductsRequest, SearchProductsResponse, DiscoverState, DiscoverDetailState } from './types';
import {
  GetProductDetailMainAPI,
  GetProductDetailsAPI,
GetMainProductsAPI, SearchProductsAPI } from './apis';

export const mainProductsAtom = atom<DiscoverState>({
  special: [],
  random: [],
  reports: [],
});


export const isSearchingAtom = atom(false);
export const searchResultAtom = atom<SearchProductsResponse | void>(undefined);

export const searchProductsAtom = atom(null, async (get, set, params: SearchProductsRequest) => {
  set(isSearchingAtom, true);
  if (!params.page) {
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
  set(mainProductsAtom, data);
});
export const productDetailAtom = atom<DiscoverDetailState | void>(undefined);

export const getProductDetailAtom = atom(null, async (get, set, product: GetProductDetailRequest) => {
  const { data } = await GetProductDetailMainAPI(product)
  set(productDetailAtom, { id: product.id, isDone: false });
  const searchResult = get(searchResultAtom);
  if (searchResult) {
    set(searchResultAtom, {
      ...searchResult,
      products: searchResult.products.map((item) => item.id === data.id ? { ...item, ...data } : item),
    });
    }
  const { data: productDetail } = await GetProductDetailsAPI(product)
  if (get(productDetailAtom)?.id === product.id) {
    set(productDetailAtom, { id: product.id, isDone: true, ...productDetail });
  }
});
