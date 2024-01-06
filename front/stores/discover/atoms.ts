import { atom } from 'jotai';
import { GetProductDetailRequest, SearchProductsResponse, DiscoverState, DiscoverDetailState } from './types';
import {
  GetProductDetailMainAPI,
  GetProductDetailsAPI,
GetMainProductsAPI, SearchProductsAPI } from './apis';

export const mainProductsAtom = atom<DiscoverState>({
  special: [],
  random: [],
  reports: [],
});

export const searchedProductsAtom = atom<SearchProductsResponse | void>(undefined);

export const searchProductsAtom = atom(null, async (get, set, query: string) => {
  set(searchedProductsAtom, undefined);
  const { data } = await SearchProductsAPI(query);
  set(searchedProductsAtom, data);
});

export const getMainProductsAtom = atom(null, async (get, set) => {
  const { data } = await GetMainProductsAPI();
  set(mainProductsAtom, data);
});
export const productDetailAtom = atom<DiscoverDetailState | void>(undefined);

export const getProductDetailAtom = atom(null, async (get, set, product: GetProductDetailRequest) => {
  const { data } = await GetProductDetailMainAPI(product)
  set(productDetailAtom, { id: product.id, isDone: false });
  set(searchedProductsAtom, get(searchedProductsAtom)?.map((item) => item.id === data.id ? { ...item, ...data } : item));
  const { data: productDetail } = await GetProductDetailsAPI(product)
  if (get(productDetailAtom)?.id === product.id) {
    set(productDetailAtom, { id: product.id, isDone: true, ...productDetail });
  }
});
