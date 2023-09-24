import client from '../../utils/axios';

import {
  Product,
  Purchase,
  GetProductsParams,
  PurchaseProductParams,
  PickHistory,
} from './types';

export const PurchaseProductAPI = (params: PurchaseProductParams) => client.post<number>('/purchase',params);
export const GetProductsAPI = (params: GetProductsParams) => client.get<Product[]>(`/purchase/products/${params.platform}`);
export const GetSubscriptionAPI = () => client.get<Purchase>(`/purchase/subscription`);
export const GetPickHistoryAPI = () => client.get<PickHistory[]>(`/purchase/history`);
