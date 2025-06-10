import Router from '@koa/router';
import { Receipt } from 'in-app-purchase';
import requireAuth from 'middleware/jwt';
import { log } from 'utils/logger';
import { subscriptionService } from '../../services/subscription.service';

const router = new Router({
  prefix: '/purchase',
});

// 구독 구매
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
    void log.error('결제 처리 중 에러 발생:', 'PURCHASE', 'HIGH', {
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
    ctx.body =
      error instanceof Error
        ? error.message
        : '결제 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요.';
  }
});

// 구독 상품 목록 조회
router.get('/products/:platform', async (ctx) => {
  const { platform } = ctx.params;

  if (!platform) {
    ctx.status = 400;
    ctx.body = '플랫폼 정보가 없습니다.';
    return;
  }

  const products = await subscriptionService.getSubscriptionProductsByPlatform(platform);

  ctx.body = products;
  ctx.status = 200;
});

// 유저 구독 목록 조회
router.get('/subscriptions', requireAuth, async (ctx) => {
  const subscriptions = await subscriptionService.getUserSubscriptions(ctx.state.user._id);
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

// 환불대상 조회
router.get('/refund', requireAuth, async (ctx) => {
  try {
    const result = await subscriptionService.checkRefundEligibility(ctx.state.user._id);
    ctx.body = result;
    ctx.status = 200;
  } catch (error) {
    void log.error('환불대상 조회 중 에러 발생:', 'PURCHASE', 'HIGH', {
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

// 환불 처리
router.post('/refund', requireAuth, async (ctx) => {
  const {
    body: { subscriptionId },
  } = <any>ctx.request;

  try {
    const result = await subscriptionService.processRefund(ctx.state.user._id, subscriptionId);
    ctx.body = result;
    ctx.status = 200;
  } catch (error) {
    void log.error('환불 처리 중 에러 발생:', 'PURCHASE', 'HIGH', {
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
