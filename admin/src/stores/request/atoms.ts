import { atom } from 'jotai';
import { RequestStatus, GetPreviewParams, Request, GetRequestParams, SendChatParams, Preview, PostAnswerParams } from './types';
import { GetRequestsAPI, PostChatAPI, GetPreviewAPI, GetRequestAPI, PostAnswerAPI } from './apis';
import { userDataAtom } from '../auth/atoms';

export const requestsAtom = atom<Request[]>([]);

export const previewAtom = atom<Preview | void>(undefined);
export const getPreviewAtom = atom(null, async (get, set, request: GetPreviewParams) => {
  const { data } = await GetPreviewAPI(request);
  set(previewAtom, data);
});

export const getRequestsAtom = atom(null, async (get, set) => {
  const { data } = await GetRequestsAPI({}); // 추후 last chat_id 추가하여 성능 개선
  set(requestsAtom, data);
});
export const getRequestAtom = atom(null, async (get, set, params: GetRequestParams) => {
  const { data } = await GetRequestAPI(params); // 추후 last chat_id 추가하여 성능 개선
  set(requestsAtom, [...get(requestsAtom), data]);
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

