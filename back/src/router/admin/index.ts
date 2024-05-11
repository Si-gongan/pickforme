import Router from '@koa/router';
import requireAuth from 'middleware/jwt';
import requireAdmin from 'middleware/admin';

import requestRouter from './request';
import noticeRouter from './notice';
import userRouter from './user';
import notificationRouter from './notification';

const router = new Router({
  prefix: '/admin',
});

router.use(requireAuth, requireAdmin);
[
  requestRouter,
  notificationRouter,
  noticeRouter,
  userRouter
].forEach((subrouter) => {
  router.use(subrouter.routes());
});

export default router;
