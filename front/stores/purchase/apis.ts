import client from '../../utils/axios';

import {
  Product,
  PurchaseProductParams,
} from './types';

export const PurchaseProductAPI = (params: PurchaseProductParams) => client.post<number>('/purchase',params);
export const GetProductsAPI = () => client.get<Product[]>('/purchase/products');
