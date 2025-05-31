import mongoose, { ClientSession, Schema, Types } from 'mongoose';
import jwt from 'utils/jwt';

import { UserDocument, UserModel, LocalRegisterPayload, PushService } from './types';
import { ProductReward } from 'models/product';
import constants from '../../constants';

const { POINTS } = constants;

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
    // 멤버쉽 시작 시점.
    MembershipAt: {
      type: Date,
      default: null,
    },
    // 멤버쉽 갱신 시점.
    // 지금 상품의 경우 한달뒤에 만료되고 갱신이 따로 없지만,
    // 한시련 이벤트의 경우 6개월 지속되기 때문에 갱신 시점을 기록하는 필드를 새롭게 만들었습니다.
    lastMembershipAt: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
    },
    event: {
      type: Number,
    },
    hide: [
      {
        // popup 모델의 popup_id 값을 저장.
        type: String,
      },
    ],
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
  if (this.point < payload) {
    throw new Error('포인트가 부족합니다.');
  }
  this.point -= payload;
  await this.save();
  return this.point;
};

UserSchema.methods.useAiPoint = async function useAiPoint(payload: number) {
  if (this.aiPoint < payload) {
    throw new Error('포인트가 부족합니다.');
  }
  this.aiPoint -= payload;
  await this.save();
  return this.aiPoint;
};

UserSchema.methods.applyPurchaseRewards = async function applyPurchaseRewards(
  rewards: ProductReward,
  session?: mongoose.ClientSession
) {
  this.point += rewards.point;
  this.aiPoint += rewards.aiPoint;

  // 멤버쉽 갱신이 아닌 만료 후 첫 멤버쉽 구매인 경우, MembershipAt을 새롭게 기록.
  // 단 기존에 MembershipAt만 있었는 경우는 (구 유저들) MembershipAt을 새롭게 기록하지 않음.
  if (!this.lastMembershipAt && !this.MembershipAt) {
    this.MembershipAt = new Date();
  }

  this.lastMembershipAt = new Date();

  // 만약 이벤트 멤버쉽 구매인 경우, event 필드에 이벤트 멤버쉽 타입을 저장.
  if (rewards.event) {
    this.event = rewards.event;
  }

  await this.save({ session });
};

UserSchema.methods.processExpiredMembership = async function processExpiredMembership(options?: {
  session?: ClientSession;
}) {
  this.point = POINTS.DEFAULT_POINT;
  this.aiPoint = POINTS.DEFAULT_AI_POINT;
  this.MembershipAt = null;
  this.lastMembershipAt = null;

  // 멤버쉽 만료 시 이벤트도 초기화해줌.
  // 한시련 이벤트 종료 시 이벤트 초기화 로직을 여기서 처리해줌.
  this.event = 0;
  await this.save(options);
};

UserSchema.methods.initMonthPoint = async function initMonthPoint() {
  this.aiPoint = POINTS.DEFAULT_AI_POINT;
  await this.save();
};

UserSchema.statics.localRegister = function localRegister({ email }: LocalRegisterPayload) {
  const user = new this({
    email,
  });

  return user.save();
};

const model: UserModel =
  (mongoose.models.Users as UserModel) ||
  mongoose.model<UserDocument, UserModel>('Users', UserSchema);

export default model;
