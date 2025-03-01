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
  aiPoint: number;
  level: number;
  push: PushSetting;
  lastLoginAt: Date;
  pushToken?: string;
  originEmail?: string;
  MembershipAt: Date;
  phone:string;
  event:number;
}

export interface UserDocument extends User, Document {
  generateToken: () => Promise<string>;
  usePoint(payload: number): () => Promise<number>;
  useAiPoint(payload: number): () => Promise<number>;
  processExpiredMembership: () => Promise<void>;
  initMonthPoint: () => Promise<void>;
}

export interface UserModel extends Model<UserDocument> {
  localRegister(payload: LocalRegisterPayload): UserDocument;
}
