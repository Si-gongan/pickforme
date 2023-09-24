import mongoose from 'mongoose';

const PickHistorySchema = new mongoose.Schema({
  usage: {
    type: String,
    required: [true, 'can\'t be null'],
  },
  point: {
    type: Number,
    required: [true, 'can\'t be null'],
  },
  diff: {
    type: Number,
    required: [true, 'can\'t be null'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: [true, 'can\'t be null'],
  },
}, {
  timestamps: true,
});

const model = mongoose.models.PickHistorys || mongoose.model('PickHistorys', PickHistorySchema);

export default model;
