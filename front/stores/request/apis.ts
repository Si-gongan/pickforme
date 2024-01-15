import client from '../../utils/axios';

import {
  Request,
  PostRequestResponse,
  RequestParams as PostRequestParams,
  GetRequestsParams,
  GetRequestParams,
  GetPreviewParams,
  ReadRequestResponse,
  SendChatParams as PostChatParams,
  ReviewRequestParams,
  Preview,
  Chat
} from './types';

export const PostRequestAPI = (params: PostRequestParams) => client.post<PostRequestResponse>('/request',params);
export const GetRequestsAPI = (params: GetRequestsParams) => client.get<Request[]>('/request');
export const GetRequestAPI = (params: GetRequestParams) => client.get<Request>(`/request/detail/${params.requestId}`);
export const ReadRequestAPI = (params: GetRequestParams) => client.get<ReadRequestResponse>(`/request/read/${params.requestId}`);
export const PostChatAPI = (params: PostChatParams) => client.post<Chat>('/request/chat',params);
export const GetPreviewAPI = (params: GetPreviewParams) => client.post<Preview>('/request/preview', params);
export const GetBuyAPI = () => client.get<boolean>('/request/buy');
export const ToggleBuyAPI = () => client.post<boolean>('/request/buy');
export const ReviewRequestAPI = (params: ReviewRequestParams) => client.post('/request/review', params);
