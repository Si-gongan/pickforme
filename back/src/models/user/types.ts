import { Model, Document, Schema } from 'mongoose';

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
  hide: string[];
}

export interface UserDocument extends User, Document {
  generateToken: () => Promise<string>;
  generateRefreshToken: () => Promise<string>; //리프레시 토큰 생성 메서드 추가
  clearRefreshToken: () => Promise<void>; //
  usePoint(payload: number): () => Promise<number>;
  useAiPoint(payload: number): () => Promise<number>;
  processExpiredMembership: () => Promise<void>;
  initMonthPoint: () => Promise<void>;
}

export interface UserModel extends Model<UserDocument> {
  localRegister(payload: LocalRegisterPayload): UserDocument;
}
