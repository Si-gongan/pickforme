import Router from '@koa/router';
import requireAuth from 'middleware/jwt';
import requireAdmin from 'middleware/admin';

import requestRouter from './request';

const router = new Router({
  prefix: '/admin',
});

[
  requestRouter,
].forEach((subrouter) => {
  router.use(subrouter.routes(), requireAuth, requireAdmin);
});

export default router;
