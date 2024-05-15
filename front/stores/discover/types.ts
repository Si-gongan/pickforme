import { Request as Report } from '../request/types';
export interface Product {
	"id": number,
	"name": string,
	"option": string,
	"price": number,
	"origin_price": number,
	"discount_rate": number,
	"reviews": number,
	"ratings": number,
	"url": string,
	"thumbnail": string
}

export interface GetProductFromUrlRequest {
  url: string;
};


export interface DiscoverState extends GetMainProductsResponse {
}

export type ProductDetail = Product;
interface History {
  price: number;
  regular_price: number;
  membership_price: number;
  created_at: string;
}

interface Section {
  name: string,
  order: number,
  products: Product[],
}

export interface GetMainProductsResponse {
  special: Product[],
  random: Product[],
  local: Section[],
  reports: Report[],
}

export type GetProductDetailMainResponse = {
  product: ProductDetail;
}
export interface GetProductDetailsResponse {
  product?: ProductDetail;
    caption?: string,
    report?: string,
    review?: {
      pros: string[]
      cons: string[],
    },
}

export interface SearchProductsResponse {
  products: Product[],
  total: number,
  count: number,
  per_page: number,
  page: number,
  last_page: number,
}
export interface SearchProductsRequest {
  page: number,
  query: string,
}

export type GetProductDetailRequest = Product;

export interface DiscoverDetailState extends GetProductDetailsResponse {
  id: string;
}
