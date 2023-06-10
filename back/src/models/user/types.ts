import {
  Model, Document,
} from 'mongoose';

export interface LocalRegisterPayload {
  email: string;
}

export interface User extends LocalRegisterPayload {
  point: number;
}

export interface UserDocument extends User, Document {
  generateToken: () => Promise<string>;
  usePoint(payload: number): () => Promise<number>;
}

export interface UserModel extends Model<UserDocument> {
  localRegister(payload: LocalRegisterPayload): UserDocument;
}
