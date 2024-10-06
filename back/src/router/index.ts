import Router from '@koa/router';

import * as fs from 'fs';
import authRouter from './auth';
import requestRouter from './request';
import purchaseRouter from './purchase';
import adminRouter from './admin';
import noticeRouter from './notice';
import discoverRouter from './discover';
import userRouter from './user';
import logRouter from './log';
import productRouter from './product';

import db from '../models';

const router = new Router();

[
  userRouter,
  adminRouter,
  noticeRouter,
  authRouter,
  requestRouter,
  purchaseRouter,
  discoverRouter,
  logRouter,
  productRouter,
].forEach((subrouter) => {
  router.use(subrouter.routes());
});

router.get('/export', async (ctx) => {
  const requests = await db.Request.find({}).populate('userId').sort({
    createdAt: -1,
  });

  const data = requests.map((request) => ({
    id: request._id.toString(),
    type: request.type,
    email: request.userId.email,
    name: request.name,
    text: request.text,
    review: request.review.rating ?? '없음',
  }));
  const array = data;

  const convertToCSV = (arr: Array<{ [key: string]: any }>) => {
    const header = `${Object.keys(arr[0]).join(',')}\n`;
    const content = arr.map((row) => Object.values(row).join(',')).join('\n');
    return `${header + content}\n`;
  };
  const saveToCSV = (inData: string, fileName: string) => {
    fs.writeFileSync(fileName, inData);
  };

  const csvData = convertToCSV(array);
  saveToCSV(csvData, 'output.csv');
  ctx.body = csvData;
});

export default router;
