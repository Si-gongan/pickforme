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

export const GetMainProductsAPI = (id: string) => client.get<GetMainProductsResponse>(`/discover/products/${id}`).catch(error => { console.log(error) });
export const GetProductAPI = (url: string) => client.post<GetProductResponse>(`/discover/product`, { url }).catch(error => { console.log(error) });
export const UpdateProductAPI = (params: GetProductDetailRequest) => client.put<GetProductResponse>('/discover/product', params).catch(error => { console.log(error) });
export const GetProductReviewAPI = (params: GetProductDetailRequest) => client.post<GetProductDetailResponse>(`/discover/product/detail/review`, params).catch(error => { console.log(error) });
export const GetProductReportAPI = (params: GetProductDetailRequest) => client.post<GetProductDetailResponse>(`/discover/product/detail/report`, params).catch(error => { console.log(error) });
export const GetProductCaptionAPI = (params: GetProductDetailRequest) => client.post<GetProductDetailResponse>(`/discover/product/detail/caption`, params).catch(error => { console.log(error) });
export const GetProductAIAnswerAPI = (params: GetProductDetailRequest) => client.post<GetProductDetailResponse>(`/discover/product/detail/ai-answer`, params).catch(error => { console.log(error) });
export const SearchProductsAPI = (params: SearchProductsRequest) => client.post<SearchProductsResponse>('/discover/search', params).catch(error => { console.log(error) });
export const ParseProductUrlAPI = (params: ParseProductUrlAPIRequest) => client.post<ParseProductUrlAPIResponse>('/discover/platform', params).catch(error => { console.log(error) });
