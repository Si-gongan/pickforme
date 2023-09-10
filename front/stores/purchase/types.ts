import { IAPItemType, } from 'expo-in-app-purchases';
import { Receipt } from 'in-app-purchase';
import { Platform } from 'react-native';

export interface Product {
  _id: string,
  productId: string,
  point: number,
  platform: typeof Platform.OS,
  displayName: string,
  type: IAPItemType,
}

export interface PurchaseProductParams extends Pick<Product, '_id'> {
  receipt: Receipt,
}

export interface GetProductsParams extends Pick<Product, 'platform'> {};
