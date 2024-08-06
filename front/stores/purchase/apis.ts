import client from '../../utils/axios';

import {
  Product,
  Purchase,
  GetProductsParams,
  PurchaseProductParams,
} from './types';

export const PurchaseProductAPI = (params: PurchaseProductParams) => client.post<Purchase | string>('/purchase', params);
export const GetProductsAPI = (params: GetProductsParams) => client.get<Product[]>(`/purchase/products/${params.platform}`);
export const GetSubscriptionAPI = () => client.get<Purchase>(`/purchase/subscription`);
export const GetSubscriptionListAPI = () => client.get<Purchase[]>(`/purchase/subscriptions`);
export const GetPurchaseListAPI = () => client.get<Purchase[]>(`/purchase/purchases`);
