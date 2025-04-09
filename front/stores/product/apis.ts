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

export const GetMainProductsAPI = (id: string) =>
    client
        .get<GetMainProductsResponse>(`/discover/products/${id}`)
        .then(response => {
            return response;
        })
        .catch(error => {
            console.log(error);
            console.log('에러 요청 URL:', error.config?.url);
            console.log('에러 요청 baseURL:', error.config?.baseURL);
            throw error;
        });
export const GetProductAPI = (url: string) => {
    console.log('GetProductAPI 호출:', { url });
    return client
        .post<GetProductResponse>(`/discover/product`, { url })
        .then(response => {
            console.log('GetProductAPI 응답:', response);
            return response;
        })
        .catch(error => {
            console.log('GetProductAPI 에러:', error);
            console.log('url :', url);
            console.log('에러 요청 URL:', error.config?.url);
            console.log('에러 요청 baseURL:', error.config?.baseURL);
            throw error;
        });
};
export const GetProductReviewAPI = (params: GetProductDetailRequest) =>
    client.post<GetProductDetailResponse>(`/discover/product/detail/review`, params).catch(error => {
        console.log(error);
        console.log('에러 요청 URL:', error.config?.url);
        console.log('에러 요청 baseURL:', error.config?.baseURL);
        throw error;
    });
export const GetProductReportAPI = (params: GetProductDetailRequest) =>
    client.post<GetProductDetailResponse>(`/discover/product/detail/report`, params).catch(error => {
        console.log(error);
        console.log('에러 요청 URL:', error.config?.url);
        console.log('에러 요청 baseURL:', error.config?.baseURL);
        throw error;
    });
export const GetProductCaptionAPI = (url: string) => {
    console.log('GetProductCaptionAPI 호출', url);
    return client
        .post<GetProductDetailResponse>(`/discover/product/detail/caption`, { url })
        .then(response => response.data)
        .catch(error => {
            console.log(error);
            console.log('에러 요청 URL:', error.config?.url, url);
            console.log('에러 요청 baseURL:', error.config?.baseURL);
            throw error;
        });
};

export const GetProductAIAnswerAPI = (params: GetProductDetailRequest) =>
    client.post<GetProductDetailResponse>(`/discover/product/detail/ai-answer`, params).catch(error => {
        console.log(error);
        console.log('에러 요청 URL:', error.config?.url);
        console.log('에러 요청 baseURL:', error.config?.baseURL);
        throw error;
    });
export const SearchProductsAPI = (params: SearchProductsRequest) =>
    client.post<SearchProductsResponse>('/discover/search', params).catch(error => {
        console.log(error);
        console.log('에러 요청 URL:', error.config?.url);
        console.log('에러 요청 baseURL:', error.config?.baseURL);
        throw error;
    });
export const ParseProductUrlAPI = (params: ParseProductUrlAPIRequest) =>
    client.post<ParseProductUrlAPIResponse>('/discover/platform', params).catch(error => {
        console.log(error);
        console.log('에러 요청 URL:', error.config?.url);
        console.log('에러 요청 baseURL:', error.config?.baseURL);
        throw error;
    });
export const UpdateProductAPI = (params: GetProductDetailRequest) =>
    client.put<GetProductResponse>('/discover/product', params).catch(error => {
        console.log(error);
    });
