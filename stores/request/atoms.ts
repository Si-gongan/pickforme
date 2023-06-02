import { atom } from 'jotai';
import { RequestStatus, Request, RequestParams } from './types';
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
    chats:[],
  };
  set(requestsAtom, get(requestsAtom).concat([data]))
  set(userDataAtom, { ...userData, point: userData.point - 500 });
});
