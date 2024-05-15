import { Product as ChatProduct } from '../discover/types';

interface Review {
  text: string,
  rating: number,
}

export enum RequestStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  CLOSED = 'CLOSED',
}

export interface Chat {
  _id: string,
  createdAt: string,
  isMine: boolean,
  questions?: string[],
  text: string,
  requestId: string,
  products?: ChatProduct[],
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
  text: string,                              
  review: Review,
  unreadCount: number,
  answer?: {
    text: string,
    products: Product[]
  },
}

export interface RecommendRequestParams {
  type: 'RECOMMEND',                         
  price: string,
  text: string,
  isPublic: boolean,
}

export interface ResearchRequestParams {
  text: string,                              
  type: 'RESEARCH',
  link: string,
}

export interface AIRequestParams {
  type: 'AI',
  text: string,
}

interface RecommendRequest extends RequestBase, RecommendRequestParams {
}

interface ResearchRequest extends RequestBase, ResearchRequestParams {
}

interface AIRequest extends RequestBase, AIRequestParams {
}

interface BuyRequest extends RequestBase {
  type: 'BUY',
}

export type Request = BuyRequest | RecommendRequest | ResearchRequest | AIRequest;
export type RequestParams = RecommendRequestParams | ResearchRequestParams | AIRequestParams;

export interface PostRequestResponse {
  request: Request,
  point: number,
}

export interface GetRequestsParams {};

export interface ReadRequestResponse extends Pick<Request, '_id' | 'unreadCount'> {};

export interface ReviewRequestParams extends Review, Pick<Request, '_id'> {};
