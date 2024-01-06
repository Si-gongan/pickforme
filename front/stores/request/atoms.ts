import { atom } from 'jotai';
import { GetPreviewParams, Request, RequestParams, SendChatParams, Preview, GetRequestParams, Chat } from './types';
import { ReadRequestAPI, PostRequestAPI, GetRequestsAPI, PostChatAPI, GetPreviewAPI, GetRequestAPI, GetBuyAPI, ToggleBuyAPI } from './apis';
import { userDataAtom } from '../auth/atoms';

export const buyAtom = atom<boolean>(false);
export const getBuyAtom = atom(null, async (get, set) => {
  const { data } = await GetBuyAPI();
  set(buyAtom, data);
});
export const toggleBuyAtom = atom(null, async (get, set) => {
  const { data } = await ToggleBuyAPI();
  set(buyAtom, data);
});

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

export const readRequestAtom = atom(null, async (get, set, params: GetRequestParams) => {
  const { data } = await ReadRequestAPI(params); // 추후 last chat_id 추가하여 성능 개선
  const requests = await get(requestsAtom);
  const has = requests.find(({ _id }) => data._id === _id);
  if (has) {
    set(requestsAtom, requests.map((request) => request === has ? {
      ...request,
      ...data,
    }: request));
  }
});

export const getRequestAtom = atom(null, async (get, set, params: GetRequestParams) => {
  const { data } = await GetRequestAPI(params); // 추후 last chat_id 추가하여 성능 개선
  const requests = await get(requestsAtom);
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

export const isSendChatLoadingAtom = atom(false);

export const sendChatAtom = atom(null, async (get, set) => {
  set(isSendChatLoadingAtom, true);
  try {
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
    const requests = await get(requestsAtom);
    params.requestId = requests.slice(-1)[0]._id;
  }
  set(sendChatParamsAtom, { text: '', requestId: params.requestId });
  const requests = await get(requestsAtom)
  const { data } = await PostChatAPI(params);
  set(receiveChatAtom, { chat: data, unreadCount: 0 });
  set(isSendChatLoadingAtom, false);
  } catch (e) {
  set(isSendChatLoadingAtom, false);
  }
});

export const receiveChatAtom = atom(null, async (get, set, params: { chat: Chat, unreadCount: number }) => {
  const { chat, unreadCount } = params;
  const requests = await get(requestsAtom);
  set(requestsAtom, requests.map((request) => request._id === chat.requestId ? {
    ...request,
    unreadCount,
    chats: [...request.chats, chat],
  } : request));
});
