import mongoose, { Schema, Types } from 'mongoose';
import jwt from 'utils/jwt';

import {
  UserDocument,
  UserModel,
  LocalRegisterPayload,
  PushService,
} from './types';

const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema<UserDocument>(
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
      type: Date,
      default: null,
    },
    phone:{
      type: String
    },
    event: {
      type: Number
    },
    hide: [{
      // popup 모델의 popup_id 값을 저장.
      type: String
    }]
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
  const token = await jwt.generateAccessToken(payload);
  return token;
};
UserSchema.methods.generateRefreshToken = async function generateRefreshToken() {
  const { _id, email } = this;
  const payload = { _id, email };
  const refreshToken = await jwt.generateRefreshToken(payload);
  
  this.refreshToken = refreshToken;
  await this.save();

  return refreshToken;
};

// ✅ Refresh Token 제거 (로그아웃 시 사용)
UserSchema.methods.clearRefreshToken = async function clearRefreshToken() {
  this.refreshToken = null;
  await this.save();
};

UserSchema.methods.usePoint = async function usePoint(payload: number) {
  if(this.point < payload){
    throw new Error('포인트가 부족합니다.');
  }
  this.point -= payload;
  await this.save();
  return this.point;
};

UserSchema.methods.useAiPoint = async function useAiPoint(payload: number) {
  if(this.aiPoint < payload){
    throw new Error('포인트가 부족합니다.');
  }
  this.aiPoint -= payload;
  await this.save();
  return this.aiPoint;
};

UserSchema.methods.processExpiredMembership =
  async function processExpiredMembership() {
    this.point = 0;
    this.aiPoint = 15;
    this.MembershipAt = null;
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
