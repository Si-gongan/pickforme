import mongoose from 'mongoose';

import User from './user';
import Session from './session';
import Request from './request';
import Chat from './chat';
import Product from './product';
import Purchase from './purchase';
import Event from './event';
import Notice from './notice';
import Notification from './notification';
import DiscoverSection from './discoverSection';
import Log from './log';
import Item from './item';
import Popup from './popup';

import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI!;
const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
  mongoose.connect(uri, {
    dbName: process.env.MODE === 'dev' ? 'pickforme-dev' : 'pickforme',
  });
}

const db = {
  User,
  Session,
  Request,
  Chat,
  Product,
  DiscoverSection,
  Purchase,
  Event,
  Notice,
  Notification,
  Log,
  Item,
  Popup,
};

export default db;
