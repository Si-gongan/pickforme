import { atom } from 'jotai';
import { GetPreviewParams, Request, GetRequestsParams, GetRequestParams, SendChatParams, Preview, PostAnswerParams } from './types';
import { GetRequestsAPI, GetRequestStatsAPI, GetUserStatsAPI, PostChatAPI, GetPreviewAPI, GetRequestAPI, PostAnswerAPI } from './apis';

export const requestsAtom = atom<Request[]>([]);
export const userStatsAtom = atom<any[]>([]);
export const requestStatsAtom = atom<any[]>([]);

export const previewAtom = atom<Preview | void>(undefined);
export const getPreviewAtom = atom(null, async (get, set, request: GetPreviewParams) => {
  const { data } = await GetPreviewAPI(request);
  set(previewAtom, data);
});

export const getRequestsAtom = atom(null, async (get, set, params: GetRequestsParams) => {
  const { data } = await GetRequestsAPI(params); // 추후 last chat_id 추가하여 성능 개선
  set(requestsAtom, data);
});

export const getRequestAtom = atom(null, async (get, set, params: GetRequestParams) => {
  const { data } = await GetRequestAPI(params); // 추후 last chat_id 추가하여 성능 개선
  set(requestsAtom, get(requestsAtom).map((request) => request._id === data._id ? data : request));
});

export const getUserStatsAtom = atom(null, async (get, set) => {
  const { data } = await GetUserStatsAPI();
  set(userStatsAtom, data);
});

export const getRequestStatsAtom = atom(null, async (get, set) => {
  const { data } = await GetRequestStatsAPI();
  set(requestStatsAtom, data);
});

export const sendChatAtom = atom(null, async (get, set, params: SendChatParams) => {
  const { data } = await PostChatAPI(params);
  const requests = get(requestsAtom)
  set(requestsAtom, requests.map((request) => request._id === params.requestId ? {
    ...request,
    chats: [...request.chats, data],
  } : request));
});

export const postAnswerAtom = atom(null, async (get, set, params: PostAnswerParams) => {
  const { data } = await PostAnswerAPI(params);  
  const requests = get(requestsAtom)           
  set(requestsAtom, requests.map((request) => request._id === params.requestId ? data : request));
});                                            

