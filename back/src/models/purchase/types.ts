import { ClientSession, Document, Model } from 'mongoose';

export interface IPurchase extends Document, IPurchaseMethods {
  receipt: any;
  product: any;
  userId: string;
  purchase: any;
  isExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPurchaseMethods {
  updateExpiration: (options?: { session?: ClientSession }) => Promise<void>;
}

export type PurchaseModel = Model<IPurchase, {}, IPurchaseMethods>;
