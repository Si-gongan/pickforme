import { Document } from 'mongoose';

export interface IPurchase extends Document {
  receipt: any;
  product: any;
  userId: string;
  purchase: any;
  isExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
  updateExpiration: () => Promise<void>;
}
