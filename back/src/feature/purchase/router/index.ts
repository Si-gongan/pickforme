// back/src/feature/purchase/router/index.ts
import Router from '@koa/router';
import subscriptionRouter from 'feature/purchase/subscription/router';
import commonRouter from 'feature/purchase/common/router';
// import oneTimeRouter from 'feature/purchase/one-time/router';

const router = new Router({ prefix: '/purchase' });

// 공통 라우터 (실패 이력/가능 여부 등)
router.use(commonRouter.routes(), commonRouter.allowedMethods());

// 구독 라우터 (내부 prefix 사용: '/subscription')
router.use(subscriptionRouter.routes(), subscriptionRouter.allowedMethods());
// router.use(oneTimeRouter.routes(), oneTimeRouter.allowedMethods());

export default router;
