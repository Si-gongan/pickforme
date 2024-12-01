import client from '../../utils/axios';

import {
  Product,
  Purchase,
  GetProductsParams,
  PurchaseProductParams,
  PurchaseSubCheck,
} from './types';

export const PurchaseProductAPI = (params: PurchaseProductParams) => client.post<Purchase | string>('/purchase', params).catch(error => { console.log(error) });
// export const GetProductsAPI = (params: GetProductsParams) => client.get<Product[]>(`/purchase/products/${params.platform}`); // ASIS
export const GetProductsAPI = (params: GetProductsParams) => client.get<Product[]>(`/product/${params.platform}`); // TOBE
export const GetSubscriptionAPI = () => client.get<Purchase>(`/purchase/subscription`).catch(error => { console.log(error) });
export const GetSubscriptionListAPI = () => client.get<Purchase[]>(`/purchase/subscriptions`);
export const GetPurchaseListAPI = () => client.get<Purchase[]>(`/purchase/purchases`);

export const GetPurchaseCheckAPI = () => client.get<Purchase[]>(`/purchase/check`);
export const GetPurchaseSubCheckAPI = () => client.get<PurchaseSubCheck>(`/purchase/subCheck`);
