export enum RequestStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  CLOSED = 'CLOSED',
}

interface Chat {
  createdAt: string,
  text: string,
  isMine: boolean,
}

interface RequestBase {
  id: number,
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

interface RecommendRequest extends RequestBase, RecommendRequestParams {
  type: 'RECOMMEND',
}

interface ResearchRequest extends RequestBase {
  type: 'RESEARCH',
  text: string
}

interface BuyRequest extends RequestBase {
  type: 'BUY',
}

export type Request = BuyRequest | RecommendRequest | ResearchRequest;
export type RequestParams = RecommendRequestParams;
