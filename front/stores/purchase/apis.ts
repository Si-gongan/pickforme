import client from '../../utils/axios';

import {
  Product,
  Purchase,
  GetProductsParams,
  PurchaseProductParams,
} from './types';

export const PurchaseProductAPI = (params: PurchaseProductParams) => client.post<Purchase | string>('/purchase', params).catch(error => { console.log(error) });
export const GetProductsAPI = (params: GetProductsParams) => client.get<Product[]>(`/purchase/products/${params.platform}`);
export const GetSubscriptionAPI = () => client.get<Purchase>(`/purchase/subscription`).catch(error => { console.log(error) });
export const GetSubscriptionListAPI = () => client.get<Purchase[]>(`/purchase/subscriptions`).catch(error => { console.log(error) });
export const GetPurchaseListAPI = () => client.get<Purchase[]>(`/purchase/purchases`);
