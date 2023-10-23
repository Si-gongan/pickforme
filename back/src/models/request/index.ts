import mongoose from 'mongoose';

export enum RequestStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  CLOSED = 'CLOSED',
}

export enum RequestType {
  RECOMMEND = 'RECOMMEND',
  RESEARCH = 'RESEARCH',
  AI = 'AI',
}

const RequestSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(RequestStatus),
    default: RequestStatus.PENDING,
  },
  type: {
    type: String,
    enum: Object.values(RequestType),
    default: RequestType.RECOMMEND,
  },
  name: {
    type: String,
  },
  text: {
    type: String,
    required: [true, 'can\'t be blank'],
  },
  price: {
    type: String,
  },
  link: {
    type: String,
  },
  answer: {
    default: undefined,
    type: {
      text: {
        type: String,
      },
      products: [{
        title: {
          type: String,
          default: '',
        },
        desc: {
          type: String,
          default: '',
        },
        price: {
          type: Number,
          default: 0,
        },
        tags: [{
          type: String,
        }],
        url: {
          type: String,
        },
      }],
    },
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
  aiData: mongoose.Schema.Types.Mixed,
  chats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chats',
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
}, {
  timestamps: true,
});

const model = mongoose.models.Requests || mongoose.model('Requests', RequestSchema);

export default model;
