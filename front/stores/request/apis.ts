import client from '../../utils/axios';

import {
  Request,
  PostRequestResponse,
  RequestParams as PostRequestParams,
  GetRequestsParams,
  GetRequestParams,
  GetPreviewParams,
  SendChatParams as PostChatParams,
  Preview,
  Chat
} from './types';

export const PostRequestAPI = (params: PostRequestParams) => client.post<PostRequestResponse>('/request',params);
export const GetRequestsAPI = (params: GetRequestsParams) => client.get<Request[]>('/request');
export const GetRequestAPI = (params: GetRequestParams) => client.get<Request>(`/admin/request/detail/${params.requestId}`);
export const PostChatAPI = (params: PostChatParams) => client.post<Chat>('/request/chat',params);
export const GetPreviewAPI = (params: GetPreviewParams) => client.post<Preview>('/request/preview', params);
