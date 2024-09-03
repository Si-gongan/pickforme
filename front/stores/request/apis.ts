import client from '../../utils/axios';

import {
  Request,
  RequestParams as PostRequestParams,
  GetRequestsParams,
} from './types';

export const PostRequestAPI = (params: PostRequestParams) => client.post<Request>('/request', params).catch(error => { console.log(error) });
export const GetRequestsAPI = (params: GetRequestsParams) => client.get<Request[]>('/request').catch(error => { console.log(error) });
export const GetRequestAPI = (requestId: string) => client.get<Request>(`/request/detail/${requestId}`).catch(error => { console.log(error) });