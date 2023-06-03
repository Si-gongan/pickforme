export enum RequestStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  CLOSED = 'CLOSED',
}

export interface Chat {
  id: string,
  createdAt: string,
  text: string,
  isMine: boolean,
  requestId: string,
  button?: {
    text: string,
    deeplink: string,
  },
}

export interface SendChatParams extends Pick<Chat, 'text' | 'requestId'> {};

interface RequestBase {
  id: string,
  name: string,
  status: RequestStatus,
  createdAt: string,
  chats: Chat[],
}

export interface RecommendRequestParams {
  type: 'RECOMMEND',                         
  text: string,                              
  price: number,
}

export interface ResearchRequestParams {
  type: 'RESEARCH',
  link: string,
  text: string,
}
interface RecommendRequest extends RequestBase, RecommendRequestParams {
}

interface ResearchRequest extends RequestBase, ResearchRequestParams {
}

interface BuyRequest extends RequestBase {
  type: 'BUY',
}

export type Request = BuyRequest | RecommendRequest | ResearchRequest;
export type RequestParams = RecommendRequestParams | ResearchRequestParams;
