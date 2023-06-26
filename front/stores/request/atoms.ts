import { atom } from 'jotai';
import { RequestStatus, GetPreviewParams, Request, RequestParams, SendChatParams, Preview, GetRequestParams } from './types';
import { PostRequestAPI, GetRequestsAPI, PostChatAPI, GetPreviewAPI, GetRequestAPI } from './apis';
import { userDataAtom } from '../auth/atoms';

export const requestsAtom = atom<Request[]>([]);

export const previewAtom = atom<Preview | void>(undefined);
export const getPreviewAtom = atom(null, async (get, set, request: GetPreviewParams) => {
  const { data } = await GetPreviewAPI(request);
  set(previewAtom, data);
});

export const addRequestAtom = atom(null, async (get, set, request: RequestParams) => {
  const userData = get(userDataAtom);
  if (!userData) {
    return;
  }
  const { data } = await PostRequestAPI(request);
  set(requestsAtom, get(requestsAtom).concat([data.request]))
  set(userDataAtom, { ...userData, point: data.point });
});

export const getRequestAtom = atom(null, async (get, set, params: GetRequestParams) => {
  const { data } = await GetRequestAPI(params); // 추후 last chat_id 추가하여 성능 개선
  set(requestsAtom, [...get(requestsAtom), data]);
});
export const getRequestsAtom = atom(null, async (get, set) => {
  const { data } = await GetRequestsAPI({}); // 추후 last chat_id 추가하여 성능 개선
  set(requestsAtom, data);
});
export const sendChatAtom = atom(null, async (get, set, params: SendChatParams) => {
  const requests = get(requestsAtom)
  const { data } = await PostChatAPI(params);
  set(requestsAtom, requests.map((request) => request._id === params.requestId ? {
    ...request,
    chats: [...request.chats, data],
  } : request));
});
