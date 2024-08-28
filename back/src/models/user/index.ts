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
    point: {
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
  if (payload > this.point) {
    throw new Error('pick error');
  }
  this.point -= payload;
  await this.save();
  return this.point;
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
