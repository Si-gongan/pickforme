import client from '../../utils/axios';

import {
  GetMainProductsResponse,
  GetProductDetailsResponse,
  GetProductDetailMainResponse,
  GetProductDetailRequest,
  SearchProductsResponse,
  SearchProductsRequest,
} from './types';

export const GetMainProductsAPI = () => client.get<GetMainProductsResponse>('/discover/products');
export const GetProductDetailMainAPI = (product: GetProductDetailRequest) => client.post<GetProductDetailMainResponse>(`/discover/product`, { product });
export const GetProductDetailsAPI = (product: GetProductDetailRequest) => client.post<GetProductDetailsResponse>(`/discover/product/detail`, { product });
export const SearchProductsAPI = (params: SearchProductsRequest) => client.post<SearchProductsResponse>('/discover/search', params);
