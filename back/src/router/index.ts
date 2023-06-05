import Router from '@koa/router';

import authRouter from './auth';
import requestRouter from './request';

const router = new Router();

router.use(authRouter.routes());
router.use(requestRouter.routes());

export default router;
