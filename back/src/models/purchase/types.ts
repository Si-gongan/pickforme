import { IProduct, Platform } from 'models/product/types';
import { ClientSession, Document, Model, Types } from 'mongoose';

interface IPurchaseData {
  quantity: number;
  productId: string;
  transactionId: string;
  originalTransactionId: string;
  purchaseDate: string;
  purchaseDateMs: number;
  purchaseDatePst: string;
  originalPurchaseDate: string;
  originalPurchaseDateMs: number;
  originalPurchaseDatePst: string;
  isTrialPeriod: string;
  inAppOwnershipType: string;
  isTrial: boolean;
  bundleId: string;
  expirationDate: number;
  isExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface IPurchase extends Document, IPurchaseMethods {
  _id: Types.ObjectId;
  receipt: string; // base64 encoded receipt string
  product: IProduct;
  userId: Types.ObjectId;
  purchase: IPurchaseData;
  isExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchaseMethods {
  updateExpiration: (options?: { session?: ClientSession }) => Promise<void>;
}

export type PurchaseModel = Model<IPurchase, {}, IPurchaseMethods>;
