import { atom } from 'jotai';
import { RequestStatus, Request, RequestParams } from './types';

export const requestsAtom = atom<Request[]>([]);

export const addRequestAtom = atom(null, (get, set, request: RequestParams) => {
  // server
  // set(requestsAtom, get(requestsAtom).concat([request]))
  const data = {
    ...request,
    id: 1,
    name: 'sample',
    status: RequestStatus.PENDING,
    createdAt: new Date().toISOString(),
    chats:[],
  };
  set(requestsAtom, get(requestsAtom).concat([data]))
});
