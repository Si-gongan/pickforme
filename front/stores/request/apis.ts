import client from '../../utils/axios';

import {
  Request,
  RequestParams as PostRequestParams,
  GetRequestsParams,
  SendChatParams as PostChatParams,
  Chat
} from './types';

export const PostRequestAPI = (params: PostRequestParams) => client.post<Request>('/request',params);
export const GetRequestsAPI = (params: GetRequestsParams) => client.get<Request[]>('/request');
export const PostChatAPI = (params: PostChatParams) => client.post<Chat>('/request/chat',params);
