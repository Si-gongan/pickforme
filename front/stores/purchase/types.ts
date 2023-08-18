import { IAPItemType } from 'expo-in-app-purchases';
import { Platform } from 'react-native';

export interface Product {
  _id: string,
  productId: string,
  point: number,
  platform: typeof Platform.OS
  type: IAPItemType,
}

export interface PurchaseProductParams extends Pick<Product, '_id'> {};
