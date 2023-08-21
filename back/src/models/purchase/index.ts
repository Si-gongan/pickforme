import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema({
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
}, {
  timestamps: true,
});

const model = mongoose.models.Purchases || mongoose.model('Purchases', PurchaseSchema);

export default model;
