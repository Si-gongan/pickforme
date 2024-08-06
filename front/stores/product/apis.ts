import client from '../../utils/axios';

import {
  GetProductResponse,
  GetProductDetailRequest,
  GetProductDetailResponse,
  GetMainProductsResponse,
  SearchProductsRequest,
  SearchProductsResponse,
  ParseProductUrlAPIRequest,
  ParseProductUrlAPIResponse
} from './types';

export const GetMainProductsAPI = (id: string) => client.get<GetMainProductsResponse>(`/discover/products/${id}`);
export const GetProductAPI = (url: string) => client.post<GetProductResponse>(`/discover/product`, { url });
export const GetProductReviewAPI = (params: GetProductDetailRequest) => client.post<GetProductDetailResponse>(`/discover/product/detail/review`, params);
export const GetProductReportAPI = (params: GetProductDetailRequest) => client.post<GetProductDetailResponse>(`/discover/product/detail/report`, params);
export const GetProductCaptionAPI = (params: GetProductDetailRequest) => client.post<GetProductDetailResponse>(`/discover/product/detail/caption`, params);
export const GetProductAIAnswerAPI = (params: GetProductDetailRequest) => client.post<GetProductDetailResponse>(`/discover/product/detail/ai-answer`, params);
export const SearchProductsAPI = (params: SearchProductsRequest) => client.post<SearchProductsResponse>('/discover/search', params);
export const ParseProductUrlAPI = (params: ParseProductUrlAPIRequest) => client.post<ParseProductUrlAPIResponse>('/discover/platform', params);
