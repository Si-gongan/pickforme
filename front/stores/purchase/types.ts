import { Receipt } from 'in-app-purchase';
import { Platform } from 'react-native';

export enum ProductType {
  PURCHASE = 0,
  SUBSCRIPTION = 1,
}

export interface Product {
  _id: string,
  productId: string,
  point: number,
  platform: typeof Platform.OS,
  displayName: string,
  type: ProductType,
}

export interface PurchaseProductParams extends Pick<Product, '_id'> {
  receipt: Receipt,
}

export interface GetProductsParams extends Pick<Product, 'platform'> {};

export interface Purchase {
  product: Product,
  userId: string,
  purchase: {
    service: string,
    status: number,
    packageName: string,
    productId: string,
    purchaseToken: string,
    startTimeMillis: number,
    expiryTimeMillis: number,
    autoRenewing: boolean,
    priceCurrencyCode: string,
    priceAmountMicros: number,
    countryCode: string,
    paymentState: number,
    orderId: string,
    purchaseType: number,
    acknowledgementState: number,
    kind: string,
    transactionId: string,
    quantity: number,
    expirationDate: string
  },
  isExpired: boolean;
}

export interface PickHistory {
  createdAt: string,
  usage: string;
  point: number;
  diff: number;
}
