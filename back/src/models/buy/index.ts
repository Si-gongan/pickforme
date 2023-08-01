import mongoose from 'mongoose';

const BuySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Users',
  },
}, {
  timestamps: true,
});

const model = mongoose.models.Buys || mongoose.model('Buys', BuySchema);

export default model;
