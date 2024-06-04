import client from '../../utils/axios';

import {
  GetMainProductsResponse,
  GetProductDetailsResponse,
  GetProductDetailMainResponse,
  GetProductDetailRequest,
  SearchProductsResponse,
  SearchProductsRequest,
  GetProductFromUrlRequest,
} from './types';

export const GetMainProductsAPI = (id: string) => client.get<GetMainProductsResponse>(`/discover/products/${id}`);
export const GetProductDetailMainAPI = (product: GetProductDetailRequest) => client.post<GetProductDetailMainResponse>(`/discover/product`, { product });
export const GetProductDetailsReviewAPI = (product: GetProductDetailRequest, reviews: string[]) => client.post<GetProductDetailsResponse>(`/discover/product/detail/review`, { product, reviews });
export const GetProductDetailsReportAPI = (product: GetProductDetailRequest, images: string[]) => client.post<GetProductDetailsResponse>(`/discover/product/detail/new-report`, { product, images });
export const GetProductDetailsCaptionAPI = (product: GetProductDetailRequest) => client.post<GetProductDetailsResponse>(`/discover/product/detail/caption`, { product });
export const SearchProductsAPI = (params: SearchProductsRequest) => client.post<SearchProductsResponse>('/discover/search', params);
export const GetProductFromUrl = (params: GetProductFromUrlRequest) => client.post<GetProductDetailsResponse>('/discover/url', params);