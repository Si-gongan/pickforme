import mongoose from 'mongoose';
import { IPurchase } from './types';

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
  // 날짜 비교: createdAt이 오늘 이전인지 확인
  // 오늘 날짜가 지났으면 isExpired를 true로 업데이트
  this.isExpired = true;
  await this.save();
};

const PurchaseModel = mongoose.model<IPurchase>('Purchases', PurchaseSchema);

export default PurchaseModel;
