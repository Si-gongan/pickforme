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
import Notice from './notice';
import Notification from './notification';
import DiscoverSection from './discoverSection';
import Log from './log';

import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI!;

mongoose.connect(uri, {
  dbName: process.env.MODE === 'dev' ? 'pickforme-dev' : 'test',
});

const db = {
  User,
  Session,
  Request,
  Chat,
  Product,
  Buy,
  DiscoverSection,
  Purchase,
  PickHistory,
  Event,
  Notice,
  Notification,
  Log
};

export default db;
