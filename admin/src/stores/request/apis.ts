import client from '../../utils/axios';

import {
  Request,
  GetRequestParams,
  GetRequestsParams,
  GetPreviewParams,
  SendChatParams as PostChatParams,
  PostAnswerParams,
  Preview,
  Chat
} from './types';

export const GetRequestsAPI = (params: GetRequestsParams) => client.get<Request[]>('/admin/request');
export const GetRequestAPI = (params: GetRequestParams) => client.get<Request>(`/admin/request/detail/${params.requestId}`);
export const PostChatAPI = (params: PostChatParams) => client.post<Chat>('/admin/request/chat',params);
export const GetPreviewAPI = (params: GetPreviewParams) => client.get<Preview>(`/admin/request/preview/${params.link}`);
export const PostAnswerAPI = (params: PostAnswerParams) => client.post<Request>(`/admin/request/answer`, params);
