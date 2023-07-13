import {
  Model, Document,
} from 'mongoose';

export interface LocalRegisterPayload {
  email: string;
}

export enum PushChat {
  off = 'off',
  report = 'report',
  all = 'all',
}

export enum PushService {
  on = 'on',
  off = 'off',
}

export interface PushSetting {
  chat: PushChat,
  service: PushService,
}

export interface User extends LocalRegisterPayload {
  point: number;
  level: number;
  push: PushSetting;
  pushToken?: string;
}

export interface UserDocument extends User, Document {
  generateToken: () => Promise<string>;
  usePoint(payload: number): () => Promise<number>;
}

export interface UserModel extends Model<UserDocument> {
  localRegister(payload: LocalRegisterPayload): UserDocument;
}
