import mongoose from 'mongoose';
import { Platform } from 'models/product';

const PurchaseFailureSchema = new mongoose.Schema(
  {
    receipt: {
      type: mongoose.Schema.Types.Mixed,
    },
    productId: {
      type: String,
    },
    platform: {
      type: String,
      enum: Object.values(Platform),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
    errorMessage: {
      type: String,
      required: true,
    },
    errorStack: {
      type: String,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const PurchaseFailure = mongoose.model('PurchaseFailures', PurchaseFailureSchema);
export default PurchaseFailure;
