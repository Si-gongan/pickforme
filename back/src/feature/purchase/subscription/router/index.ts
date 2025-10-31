import Router from '@koa/router';
import { Receipt } from 'in-app-purchase';
import requireAuth from 'middleware/jwt';
import { log } from 'utils/logger';
import PurchaseFailure from 'models/purchase/failure';
import { formatError } from 'utils/error';
import { purchaseFailureService } from '../service/purchase-failure.service';
import { subscriptionQueryService } from '../service/subscription-query.service';
import { subscriptionManagementService } from '../service/subscription-management.service';
import { subscriptionCreationService } from '../service/subscription-creation.service';

const subscriptionRouter = new Router({
  prefix: '/subscription',
});

// 구독 구매 -> POST /purchase/subscription
subscriptionRouter.post('/', requireAuth, async (ctx) => {
  const { receipt, _id: productId } = <{ _id: string; receipt: Receipt }>ctx.request.body;
  const userId = ctx.state?.user?._id;

  if (!receipt || !productId || !userId) {
    void log.error('구독 요청 파라미터 누락', 'PURCHASE', 'CRITICAL', {
      receipt,
      productId,
      userId,
      endPoint: '/purchase/subscription',
      method: 'POST',
    });

    ctx.status = 400;
    ctx.body = '잘못된 요청입니다.';
    return;
  }

  try {
    const purchaseFailure = await purchaseFailureService.checkPurchaseFailure(userId);
    if (purchaseFailure.hasFailedPurchase) {
      throw new Error('아직 처리되지 않은 구독 실패 내역이 있습니다.');
    }

    const purchaseData = await subscriptionCreationService.createSubscription(
      userId,
      productId,
      receipt
    );

    ctx.status = 200;
    ctx.body = purchaseData;
  } catch (error) {
    const errorMeta = formatError(error);

    try {
      const alreadyLogged = await PurchaseFailure.findOne({ receipt });

      if (!alreadyLogged) {
        await PurchaseFailure.create({
          userId,
          receipt,
          productId,
          errorMessage: errorMeta.message,
          errorStack: errorMeta.stack,
          meta: errorMeta,
        });
      }

      void log.error(
        '결제 처리 중 에러 발생:',
        'PURCHASE',
        'HIGH',
        {
          error: errorMeta,
          endPoint: '/purchase/subscription',
          method: 'POST',
          userId: ctx.state.user._id,
          productId,
        },
        process.env.SLACK_SERVICE_NOTIFICATION_CHANNEL_ID
      );
    } catch (error2) {
      void log.error(
        '결제 실패 기록 저장 실패:',
        'PURCHASE',
        'HIGH',
        {
          error: formatError(error2),
          endPoint: '/purchase/subscription',
          method: 'POST',
          userId: ctx.state.user._id,
          productId,
          receipt,
        },
        process.env.SLACK_SERVICE_NOTIFICATION_CHANNEL_ID
      );
    }

    ctx.status = 400;
    ctx.body =
      error instanceof Error
        ? error.message
        : '결제 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요.';
  }
});

// 구독 상품 목록 조회 -> GET /purchase/subscription/products/:platform
subscriptionRouter.get('/products/:platform', async (ctx) => {
  const { platform } = ctx.params;

  if (!platform) {
    ctx.status = 400;
    ctx.body = '플랫폼 정보가 없습니다.';
    return;
  }

  const products = await subscriptionQueryService.getSubscriptionProductsByPlatform(platform);
  ctx.body = products;
  ctx.status = 200;
});

// 유저 구독 목록 조회 -> GET /purchase/subscription/list
subscriptionRouter.get('/list', requireAuth, async (ctx) => {
  const subscriptions = await subscriptionQueryService.getUserSubscriptions(ctx.state.user._id);
  ctx.body = subscriptions;
  ctx.status = 200;
});

// 구독 상태 조회 -> GET /purchase/subscription/status
subscriptionRouter.get('/status', requireAuth, async (ctx) => {
  try {
    const status = await subscriptionQueryService.getSubscriptionStatus(ctx.state.user._id);
    ctx.body = status;
    ctx.status = 200;
  } catch (error) {
    void log.error('구독 상태 조회 중 에러:', 'PURCHASE', 'HIGH', {
      error: {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'UnknownError',
        stack: error instanceof Error ? error.stack : 'UnknownError',
      },
      endPoint: '/purchase/subscription/status',
      method: 'GET',
      userId: ctx.state.user._id,
    });
    ctx.body = {
      subscription: null,
      activate: false,
      leftDays: 0,
      expiresAt: null,
      msg: '[SERVER ERROR] : 구독 상태 조회 중 오류가 발생했습니다.',
    };
    ctx.status = 500;
  }
});

// 환불대상 조회 -> GET /purchase/subscription/refund
subscriptionRouter.get('/refund', requireAuth, async (ctx) => {
  try {
    const result = await subscriptionManagementService.checkRefundEligibility(ctx.state.user._id);
    ctx.body = result;
    ctx.status = 200;
  } catch (error) {
    void log.error('환불대상 조회 중 에러 발생:', 'PURCHASE', 'HIGH', {
      error: {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'UnknownError',
        stack: error instanceof Error ? error.stack : 'UnknownError',
      },
      endPoint: '/purchase/subscription/refund',
      method: 'GET',
      userId: ctx.state.user._id,
    });
    ctx.body = {
      isRefundable: false,
      msg: '[SERVER ERROR] : FS02',
    };
    ctx.status = 500;
  }
});

// 환불 처리 -> POST /purchase/subscription/refund
subscriptionRouter.post('/refund', requireAuth, async (ctx) => {
  const {
    body: { subscriptionId },
  } = <any>ctx.request;

  try {
    const result = await subscriptionManagementService.processRefund(
      ctx.state.user._id,
      subscriptionId
    );
    ctx.body = result;
    ctx.status = 200;
  } catch (error) {
    void log.error('환불 처리 중 에러 발생:', 'PURCHASE', 'HIGH', {
      error: {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'UnknownError',
        stack: error instanceof Error ? error.stack : 'UnknownError',
      },
      endPoint: '/purchase/subscription/refund',
      method: 'POST',
      userId: ctx.state.user._id,
    });
    ctx.body = {
      msg: error instanceof Error ? error.message : '[SERVER ERROR] : RF01',
      refundSuccess: false,
    };
    ctx.status = error instanceof Error ? 400 : 500;
  }
});

// 결제 실패 이력 조회는 공통 엔드포인트로 승격하여 어그리게이터 라우터에서 처리합니다.

// 결제 실패 재시도 -> POST /purchase/subscription/retry
subscriptionRouter.post('/retry', requireAuth, async (ctx) => {
  const { userId, _id: productId, receipt } = <any>ctx.request.body;

  if (!userId || !productId || !receipt) {
    ctx.status = 400;
    ctx.body = { error: '필수 항목이 누락되었습니다.' };
    return;
  }

  try {
    const result = await subscriptionCreationService.createSubscription(userId, productId, receipt);
    await subscriptionCreationService.sendNotificationForManualSubscription(userId);
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    const errorMeta = formatError(error);
    void log.error('결제 재시도 처리 중 에러 발생', 'PURCHASE', 'HIGH', {
      error: errorMeta,
      userId,
      productId,
      endPoint: '/purchase/subscription/retry',
      method: 'POST',
    });

    ctx.status = 500;
    ctx.body = {
      error: error instanceof Error ? error.message : '결제 재시도 중 오류가 발생했습니다.',
    };
  }
});

// 구매 검증 없이 직접 구독 생성(어드민) -> POST /purchase/subscription/admin/retry
subscriptionRouter.post('/admin/retry', requireAuth, async (ctx) => {
  const { userId, _id: productId, receipt } = <any>ctx.request.body;

  if (!userId || !productId) {
    ctx.status = 400;
    ctx.body = { error: '필수 항목이 누락되었습니다.' };
    return;
  }

  try {
    const result = await subscriptionCreationService.createSubscriptionWithoutValidation(
      userId,
      productId,
      receipt
    );

    await subscriptionCreationService.sendNotificationForManualSubscription(userId);

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    const errorMeta = formatError(error);
    void log.error('어드민 구독 생성 중 에러 발생', 'PURCHASE', 'HIGH', {
      error: errorMeta,
      userId,
      productId,
      endPoint: '/purchase/subscription/admin/create',
      method: 'POST',
    });

    ctx.status = 500;
    ctx.body = {
      error: error instanceof Error ? error.message : '구독 생성 중 오류가 발생했습니다.',
    };
  }
});

export default subscriptionRouter;
