import mongoose from 'mongoose';

import User from './user';
import Session from './session';
import Request from './request';
import Chat from './chat';
import Product from './product';

const uri = process.env.MONGO_URI!;

mongoose.connect(uri);

const db = {
  User,
  Session,
  Request,
  Chat,
  Product,
};

export default db;
