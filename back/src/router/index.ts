import Router from '@koa/router';

import authRouter from './auth';
import requestRouter from './request';
import purchaseRouter from './purchase';

const router = new Router();

[
  authRouter,
  requestRouter,
  purchaseRouter,
].forEach((subrouter) => {
  router.use(subrouter.routes());
})

export default router;
