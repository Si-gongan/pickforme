import Router from '@koa/router';

import authRouter from './auth';
import requestRouter from './request';
import purchaseRouter from './purchase';
import adminRouter from './admin';

const router = new Router();

[
  adminRouter,
  authRouter,
  requestRouter,
  purchaseRouter,
].forEach((subrouter) => {
  router.use(subrouter.routes());
});

export default router;
