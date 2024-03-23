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

export const GetRequestsAPI = (params: GetRequestsParams) => {
  let url = '/admin/request';

  // 쿼리 파라미터를 배열에 조건부로 추가
  const queryParams = [];
  if (params.start) {
    queryParams.push(`start=${params.start}`);
  }
  if (params.end) {
    queryParams.push(`end=${params.end}`);
  }

  // 쿼리 파라미터가 있으면 URL에 추가
  if (queryParams.length) {
    url += '?' + queryParams.join('&');
  }

  return client.get<Request[]>(url);
};
export const GetRequestAPI = (params: GetRequestParams) => client.get<Request>(`/admin/request/detail/${params.requestId}`);
export const GetUserStatsAPI = () => client.get('/admin/request/user-stats');
export const GetRequestStatsAPI = () => client.get('/admin/request/request-stats');
export const PostChatAPI = (params: PostChatParams) => client.post<Chat>('/admin/request/chat',params);
export const GetPreviewAPI = (params: GetPreviewParams) => client.get<Preview>(`/admin/request/preview/${params.link}`);
export const PostAnswerAPI = (params: PostAnswerParams) => client.post<Request>(`/admin/request/answer`, params);
