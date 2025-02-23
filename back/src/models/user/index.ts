import mongoose, { Schema } from 'mongoose';
import jwt from 'utils/jwt';

import {
  UserDocument,
  UserModel,
  LocalRegisterPayload,
  PushService,
} from './types';

const uniqueValidator = require('mongoose-unique-validator');

const UserSchema: Schema<UserDocument> = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "can't be blank"],
      index: true,
    },
    // 매니저 요청 횟수
    point: {
      type: Number,
      default: 0,
    },
    // AI 요청 횟수
    aiPoint: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    pushToken: {
      type: String,
    },
    push: {
      service: {
        type: String,
        enum: Object.values(PushService),
        default: PushService.on,
      },
    },
    originEmail: {
      type: String,
    },
    MembershipAt: {
      type: Date
    },
    phone:{
      type: String
    }
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(uniqueValidator, {
  message: 'is already taken.',
});

UserSchema.methods.generateToken = async function generateToken() {
  const { _id, email } = this;
  const payload = {
    _id,
    email,
  };
  const token = await jwt(payload);
  return token;
};

UserSchema.methods.usePoint = async function usePoint(payload: number) {
  this.point -= payload;
  await this.save();
  return this.point;
};

UserSchema.methods.useAiPoint = async function useAiPoint(payload: number) {
  this.aiPoint -= payload;
  await this.save();
  return this.aiPoint;
};

UserSchema.methods.processExpiredMembership =
  async function processExpiredMembership() {
    this.point = 0;
    this.aiPoint = 15;
    await this.save();
  };

UserSchema.methods.initMonthPoint = async function initMonthPoint() {
  this.aiPoint = 15;
  await this.save();
};

UserSchema.statics.localRegister = function localRegister({
  email,
}: LocalRegisterPayload) {
  const user = new this({
    email,
  });

  return user.save();
};

const model: UserModel =
  (mongoose.models.Users as UserModel) ||
  mongoose.model<UserDocument, UserModel>('Users', UserSchema);

export default model;
