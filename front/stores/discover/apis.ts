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
export const GetProductDetailsReviewAPI = (product: GetProductDetailRequest) => client.post<GetProductDetailsResponse>(`/discover/product/detail/review`, { product });
export const GetProductDetailsReportAPI = (product: GetProductDetailRequest) => client.post<GetProductDetailsResponse>(`/discover/product/detail/new-report`, { product });
export const GetProductDetailsCaptionAPI = (product: GetProductDetailRequest) => client.post<GetProductDetailsResponse>(`/discover/product/detail/caption`, { product });
export const SearchProductsAPI = (params: SearchProductsRequest) => client.post<SearchProductsResponse>('/discover/search', params);
