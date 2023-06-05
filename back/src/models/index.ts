import mongoose from 'mongoose';

import User from './user';
import Session from './session';
import Request from './request';
import Chat from './chat';

const uri = process.env.MONGO_URI!;

mongoose.connect(uri);

const db = {
  User,
  Session,
  Request,
  Chat,
};

export default db;
