import Router from '@koa/router';
import requireAuth from 'middleware/jwt';
import requireAdmin from 'middleware/admin';

import requestRouter from './request';
import noticeRouter from './notice';

const router = new Router({
  prefix: '/admin',
});

[
  requestRouter,
  noticeRouter,
].forEach((subrouter) => {
  router.use(subrouter.routes(), requireAuth, requireAdmin);
});

export default router;
