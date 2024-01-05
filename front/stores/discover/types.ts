import { Request as Report } from '../request/types';
export interface Product {
  productId: number,
  productName: string,
  productPrice: number,
  productImage: string,
  productUrl: string,
  categoryName: string,
  keyword: string,
  rank: 1,
  isRocket: boolean,
  isFreeShipping: boolean,
}

export interface DiscoverState extends GetMainProductsResponse {
  
}

export interface GetMainProductsResponse {
  special: Product[],
  random: Product[],
  reports: Report[],
}

