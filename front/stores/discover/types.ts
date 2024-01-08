import { ChatProduct, Request as Report } from '../request/types';
export interface Product {
  productId: number,
  productName: string,
  productPrice: number,
  productImage: string,
  productUrl: string,
  categoryName: string,
  keyword: string,
  rank: number,
  isRocket: boolean,
  isFreeShipping: boolean,
}

export interface DiscoverState extends GetMainProductsResponse {
}

interface ProductDetail {
  id: number;
  hash: string;
  name: string;
  option: string;
  stock: number;
  discount_rate: number;
  discount_price: number;
  price: number;
  price_per_unit: string;
  membership_price_per_unit: string;
  code: string;
  group: string;
  content: string[];
  brand: string;
  reviews: number;
  ratings: number;
  category: string;
  location: string;
  url: string;
  canonical_url: string;
  favorite: string;
  notification: string;
  thumbnail: string;
  express_shipping: string;
  highest_price: number;
  lowest_price: number;
  average_price: number;
  regular_price: number;
  highest_regular_price: number;
  lowest_regular_price: number;
  average_regular_price: number;
  membership_price: number;
  highest_membership_price: number;
  lowest_membership_price: number;
  average_membership_price: number;
  picture: string;
  photo: string;
  siblings: ProductDetail[];
  purchase_index: number;
  histories: History[];
  recommendations: ProductDetail[];
}
interface History {
  price: number;
  regular_price: number;
  membership_price: number;
  created_at: string;
}

export interface GetMainProductsResponse {
  special: Product[],
  random: Product[],
  reports: Report[],
}

export type GetProductDetailMainResponse = ProductDetail;
export interface GetProductDetailsResponse {
    caption?: string,
    report?: string,
    review?: {
      pros: string[]
      cons: string[],
    },
}

interface DetailedProduct extends ChatProduct, ProductDetail {};
export interface SearchProductsResponse {
  products: DetailedProduct[],
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

export type GetProductDetailRequest = ChatProduct;

export interface DiscoverDetailState extends GetProductDetailsResponse {
  id: number,
  isDone: boolean,
  }
