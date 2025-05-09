import Router from '@koa/router';
import { Receipt } from 'in-app-purchase';
import requireAuth from 'middleware/jwt';
import db from 'models';
import { ProductType } from 'models/product';
import { log, LogContext, LogSeverity } from 'utils/logger';
import { subscriptionService } from '../../services/subscription.service';

const router = new Router({
  prefix: '/purchase',
});

// 포인트충전
router.post('/', requireAuth, async (ctx) => {
  try {
    const { receipt, _id: productId } = <{ _id: string; receipt: Receipt }>ctx.request.body;

    if (!receipt || !productId) {
      ctx.status = 400;
      ctx.body = '잘못된 요청입니다.';
      return;
    }

    const purchaseData = await subscriptionService.createSubscription(
      ctx.state.user._id,
      productId,
      receipt
    );

    ctx.status = 200;
    ctx.body = purchaseData;

  } catch (error) {
    log.error(LogContext.PURCHASE, '결제 처리 중 에러 발생:', LogSeverity.HIGH, {
      error: {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'UnknownError',
        stack: error instanceof Error ? error.stack : 'UnknownError',
      },
      endPoint: '/purchase',
      method: 'POST',
      userId: ctx.state.user._id, 
    });

    ctx.status = 400;
    ctx.body = error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요.';
  }
});

// 상품목록
router.get('/products/:platform', async (ctx) => {
  // NOTE: 상품 노출 시 활성화

  const { platform } = ctx.params;
  const products = await db.Product.find({
    platform,
    type: ProductType.SUBSCRIPTION,
  });
  ctx.body = products;

  // ctx.body = [];
  ctx.status = 200;
});

router.get('/subscriptions', requireAuth, async (ctx) => {
  const subscriptions = await db.Purchase.find({
    userId: ctx.state.user._id,
    'product.type': ProductType.SUBSCRIPTION,
  }).sort({
    createdAt: -1,
  });
  ctx.body = subscriptions;
  ctx.status = 200;
});

// 구독 상태 조회
router.get('/subscription/status', requireAuth, async (ctx) => {
  try {
    const status = await subscriptionService.getSubscriptionStatus(ctx.state.user._id);
    ctx.body = status;
    ctx.status = 200;
  } catch (error) {
    console.error('구독 상태 조회 중 에러:', error);
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

// NOTE: 환불대상 조회
router.get('/refund', requireAuth, async (ctx) => {
  try {
    const result = await subscriptionService.checkRefundEligibility(ctx.state.user._id);
    ctx.body = result;
    ctx.status = 200;
  } catch (error) {
    log.error(LogContext.PURCHASE, '환불대상 조회 중 에러 발생:', LogSeverity.HIGH, {
      error: {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'UnknownError',
        stack: error instanceof Error ? error.stack : 'UnknownError',
      },
      endPoint: '/purchase/refund',
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

// NOTE: 환불 처리
router.post('/refund', requireAuth, async (ctx) => {
  const {
    body: { subscriptionId },
  } = <any>ctx.request;

  try {
    const result = await subscriptionService.processRefund(ctx.state.user._id, subscriptionId);
    ctx.body = result;
    ctx.status = 200;
  } catch (error) {
    log.error(LogContext.PURCHASE, '환불 처리 중 에러 발생:', LogSeverity.HIGH, {
      error: {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'UnknownError',
        stack: error instanceof Error ? error.stack : 'UnknownError',
      },
      endPoint: '/purchase/refund',
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

export default router;
