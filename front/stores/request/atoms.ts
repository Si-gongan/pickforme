import { atom } from 'jotai';
import { RequestStatus, GetPreviewParams, Request, RequestParams, SendChatParams, Preview, GetRequestParams, Chat } from './types';
import { PostRequestAPI, GetRequestsAPI, PostChatAPI, GetPreviewAPI, GetRequestAPI } from './apis';
import { userDataAtom } from '../auth/atoms';

export const requestsAtom = atom<Request[]>([]);

export const previewAtom = atom<Preview | void>(undefined);
export const getPreviewAtom = atom(null, async (get, set, request: GetPreviewParams) => {
  const { data } = await GetPreviewAPI(request);
  set(previewAtom, data);
});

export const addRequestAtom = atom(null, async (get, set, request: RequestParams) => {
  const userData = await get(userDataAtom);
  if (!userData) {
    return;
  }
  const { data } = await PostRequestAPI(request);
  set(requestsAtom, get(requestsAtom).concat([data.request]))
  set(userDataAtom, { ...userData, point: data.point });
});

export const getRequestAtom = atom(null, async (get, set, params: GetRequestParams) => {
  const { data } = await GetRequestAPI(params); // 추후 last chat_id 추가하여 성능 개선
  const requests = get(requestsAtom);
  const has = requests.find(({ _id }) => data._id === _id);
  if (has) {
    set(requestsAtom, requests.map((request) => request === has ? data : request));
  } else {
    set(requestsAtom, [...requests, data]);
  }
});
export const getRequestsAtom = atom(null, async (get, set) => {
  const { data } = await GetRequestsAPI({}); // 추후 last chat_id 추가하여 성능 개선
  set(requestsAtom, data);
});

export const sendChatParamsAtom = atom<SendChatParams>({
  text: '',
  requestId: '',
});

export const sendChatAtom = atom(null, async (get, set) => {
  const params = get(sendChatParamsAtom);
  if (!params.text) {
    return;
  }
  if (!params.requestId) {
    set(sendChatParamsAtom, { text: '', requestId: params.requestId });
    await set(addRequestAtom, {
      type: 'AI',
      text: params.text,
    });
    const requests = get(requestsAtom);
    params.requestId = requests.slice(-1)[0]._id;
  }
  set(sendChatParamsAtom, { text: '', requestId: params.requestId });
  const requests = get(requestsAtom)
  const { data } = await PostChatAPI(params);
  set(receiveChatAtom, data);
});

export const receiveChatAtom = atom(null, (get, set, chat: Chat) => {
  set(requestsAtom, get(requestsAtom).map((request) => request._id === chat.requestId ? {
    ...request,
    chats: [...request.chats, chat],
  } : request));
});
