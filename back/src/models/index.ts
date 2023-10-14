import mongoose from 'mongoose';

import User from './user';
import Session from './session';
import Request from './request';
import Chat from './chat';
import Product from './product';
import Buy from './buy';
import PickHistory from './pickHistory';
import Purchase from './purchase';
import Event from './event';

const uri = process.env.MONGO_URI!;

mongoose.connect(uri);

const db = {
  User,
  Session,
  Request,
  Chat,
  Product,
  Buy,
  Purchase,
  PickHistory,
  Event,
};

export default db;
