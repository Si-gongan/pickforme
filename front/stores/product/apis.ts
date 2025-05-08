import client, { handleApiError } from '../../utils/axios';

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

export const GetMainProductsAPI = (id: string) =>
    client
        .get<GetMainProductsResponse>(`/discover/products/${id}`)
        .catch(error => handleApiError(error, 'GetMainProducts'));
export const GetProductAPI = (url: string) =>
    client
        .post<GetProductResponse>(`/discover/product`, { url })
        .catch(error => handleApiError(error, 'GetMainProducts'));

export const GetProductReviewAPI = (params: GetProductDetailRequest) =>
    client
        .post<GetProductDetailResponse>(`/discover/product/detail/review`, params)
        .catch(error => handleApiError(error, 'GetMainProducts'));

export const GetProductReportAPI = (params: GetProductDetailRequest) =>
    client
        .post<GetProductDetailResponse>(`/discover/product/detail/report`, params)
        .catch(error => handleApiError(error, 'GetMainProducts'));

export const GetProductCaptionAPI = (params: GetProductDetailRequest) => {
    console.log('GetProductCaptionAPI 호출');
    return client
        .post<GetProductDetailResponse>(`/discover/product/detail/caption`, params)
        .catch(error => handleApiError(error, 'GetMainProducts'));
};

export const GetProductAIAnswerAPI = (params: GetProductDetailRequest) =>
    client
        .post<GetProductDetailResponse>(`/discover/product/detail/ai-answer`, params)
        .catch(error => handleApiError(error, 'GetMainProducts'));

export const SearchProductsAPI = (params: SearchProductsRequest) =>
    client
        .post<SearchProductsResponse>('/discover/search', params)
        .catch(error => handleApiError(error, 'GetMainProducts'));

export const ParseProductUrlAPI = (params: ParseProductUrlAPIRequest) =>
    client
        .post<ParseProductUrlAPIResponse>('/discover/platform', params)
        .catch(error => handleApiError(error, 'GetMainProducts'));

export const UpdateProductAPI = (params: GetProductDetailRequest) =>
    client
        .put<GetProductResponse>('/discover/product', params)
        .catch(error => handleApiError(error, 'GetMainProducts'));
