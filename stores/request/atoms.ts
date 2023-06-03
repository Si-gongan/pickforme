import { atom } from 'jotai';
import { RequestStatus, Request, RequestParams, SendChatParams } from './types';
import { userDataAtom } from '../auth/atoms';

export const requestsAtom = atom<Request[]>([]);

export const addRequestAtom = atom(null, (get, set, request: RequestParams) => {
  const userData = get(userDataAtom);
  if (!userData) {
    return;
  }
  // server
  // set(requestsAtom, get(requestsAtom).concat([request]))
  const data = {
    ...request,
    id: '1',
    name: 'sample',
    status: RequestStatus.PENDING,
    createdAt: new Date().toISOString(),
    chats: [{
      id: '1',
      requestId: '1',
      text: '픽포미 추천 의뢰가 성공적으로 접수되었습니다. 답변은 1~2시간 이내에 작성되며, 추가적인 문의사항이 있으실 경우 메세지를 남겨주세요.',
      createdAt: new Date().toISOString(),
      isMine: false,
      button: {
        text: '의뢰 내용 보기',
        deeplink: '/',
      },
    }],
  };
  set(requestsAtom, get(requestsAtom).concat([data]))
  set(userDataAtom, { ...userData, point: userData.point - 500 });
});

export const sendChatAtom = atom(null, (get, set, params: SendChatParams) => {
  const data = {
    id: Math.random().toString(),
    ...params,
    isMine: true,
    createdAt: new Date().toISOString(),
  }
  const requests = get(requestsAtom)
  set(requestsAtom, requests.map((request) => request.id === params.requestId ? {
    ...request,
    chats: [...request.chats, data],
  } : request));
});
