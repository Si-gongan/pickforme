import { Model, Document } from 'mongoose';

export interface LocalRegisterPayload {
  email: string;
}

export enum PushService {
  on = 'on',
  off = 'off',
}

export interface PushSetting {
  service: PushService;
}

export interface User extends LocalRegisterPayload {
  point: number;
  level: number;
  push: PushSetting;
  lastLoginAt: Date;
  pushToken?: string;
  originEmail?: string;
}

export interface UserDocument extends User, Document {
  generateToken: () => Promise<string>;
  usePoint(payload: number): () => Promise<number>;
}

export interface UserModel extends Model<UserDocument> {
  localRegister(payload: LocalRegisterPayload): UserDocument;
}
