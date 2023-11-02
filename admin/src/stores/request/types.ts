import { UserData } from '../auth/types';
export enum RequestStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  CLOSED = 'CLOSED',
}

export interface Chat {
  _id: string,
  createdAt: string,
  isMine: boolean,
  text: string,
  requestId: string,
  button?: {
    text: string,
    deeplink: string,
  },
}

export interface Preview {
  link: string,
  image: string,
  title: string,
  desc: string,
}

export interface GetPreviewParams extends Pick<Preview, 'link'> {};

export interface SendChatParams extends Pick<Chat, 'text' | 'requestId'> {};
export interface GetRequestParams extends Pick<Chat, 'requestId'> {};

export interface Product {
  title: string,
  desc: string,
  url: string,
  price: number,
  tags: string[],
}

interface RequestBase {
  _id: string,
  name: string,
  status: RequestStatus,
  createdAt: string,
  chats: Chat[],
  userId?: UserData,
  text: string,                              
  answer: {
    text: string,
    products: Product[]
  },
}

export interface PostAnswerParams extends Pick<Request, 'answer'>, Pick<Chat, 'requestId'> {
};

export interface RecommendRequestParams {
  type: 'RECOMMEND',                         
  price: string,
  text: string,                              
}

export interface ResearchRequestParams {
  text: string,                              
  type: 'RESEARCH',
  link: string,
}
interface RecommendRequest extends RequestBase, RecommendRequestParams {
}

interface ResearchRequest extends RequestBase, ResearchRequestParams {
}

interface BuyRequest extends RequestBase {
  type: 'BUY',
}

export type Request = BuyRequest | RecommendRequest | ResearchRequest;

export interface GetRequestsParams {};
