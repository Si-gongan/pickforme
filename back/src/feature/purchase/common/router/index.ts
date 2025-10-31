import Router from '@koa/router';
import requireAuth from 'middleware/jwt';
import { log } from 'utils/logger';
import PurchaseFailure from 'models/purchase/failure';
import { purchaseFailureService } from 'feature/purchase/common/service/purchase-failure.service';

const commonRouter = new Router();

// 공통: 결제 실패 이력 조회 -> GET /purchase/failures
commonRouter.get('/failures', requireAuth, async (ctx) => {
  const {
    userId,
    productId,
    platform,
    startDate,
    endDate,
    limit = 20,
    skip = 0,
  } = ctx.query as any;

  const query: Record<string, any> = {};
  if (userId) query.userId = userId;
  if (productId) query.productId = productId;
  if (platform) query.platform = platform;
  if (startDate || endDate) {
    query.createdAt = {} as any;
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) query.createdAt.$lte = new Date(endDate as string);
  }

  try {
    const [results, total] = await Promise.all([
      PurchaseFailure.find(query)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      PurchaseFailure.countDocuments(query),
    ]);

    ctx.body = { total, results };
    ctx.status = 200;
  } catch (error) {
    void log.error('결제 실패 이력 조회 중 에러:', 'PURCHASE', 'HIGH', {
      error: {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'UnknownError',
        stack: error instanceof Error ? error.stack : 'UnknownError',
      },
      endPoint: '/purchase/failures',
      method: 'GET',
    });

    ctx.status = 500;
    ctx.body = { msg: '결제 실패 이력 조회 중 서버 오류가 발생했습니다.' };
  }
});

// 공통: 내 결제 가능 여부 조회 (실패 이력 기반) -> GET /purchase/my-failures
commonRouter.get('/my-failures', requireAuth, async (ctx) => {
  try {
    const userId = ctx.state.user._id;
    const { hasFailedPurchase } = await purchaseFailureService.checkPurchaseFailure(userId);
    ctx.body = { canPurchase: !hasFailedPurchase };
    ctx.status = 200;
  } catch (error) {
    void log.error('사용자 결제 가능 여부 조회 중 에러:', 'PURCHASE', 'HIGH', {
      error: {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'UnknownError',
        stack: error instanceof Error ? error.stack : 'UnknownError',
      },
      endPoint: '/purchase/my-failures',
      method: 'GET',
      userId: ctx.state.user._id,
    });

    ctx.status = 500;
    ctx.body = { msg: '결제 가능 여부 확인 중 서버 오류가 발생했습니다.' };
  }
});

export default commonRouter;
