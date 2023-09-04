import client from '../../utils/axios';

import {
  Product,
  GetProductsParams,
  PurchaseProductParams,
} from './types';

export const PurchaseProductAPI = (params: PurchaseProductParams) => client.post<number>('/purchase',params);
export const GetProductsAPI = (params: GetProductsParams) => client.get<Product[]>(`/purchase/products/${params.platform}`);
