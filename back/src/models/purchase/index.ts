import mongoose from 'mongoose';
import { IPurchase, PurchaseModel } from './types';

const PurchaseSchema = new mongoose.Schema(
  {
    receipt: {
      type: mongoose.Schema.Types.Mixed,
    },
    product: {
      type: mongoose.Schema.Types.Mixed,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
    purchase: {
      type: mongoose.Schema.Types.Mixed,
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 도메인 메서드 정의
PurchaseSchema.methods.updateExpiration = async function updateExpiration() {
  this.isExpired = true;
  await this.save();
};

const Purchase = mongoose.model<IPurchase, PurchaseModel>(
  'Purchases',
  PurchaseSchema
);

export default Purchase;
