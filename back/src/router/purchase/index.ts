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
  let subscription;
  try {
    subscription = await db.Purchase.findOne({
      userId: ctx.state.user._id,
      isExpired: false,
      'product.type': ProductType.SUBSCRIPTION,
    }).sort({
      createdAt: -1,
    });
  } catch (error) {
    console.log(error);

    ctx.body = {
      sub: null,
      msg: '[SERVER ERROR] : FS02',
    };
    ctx.status = 500;
    return;
  }

  ctx.body = {
    sub: subscription,
    msg: subscription ? '환불대상을 조회하였습니다.' : '환불대상이 없습니다.',
  };
  ctx.status = 200;
});

// NOTE: 환불(미사용 / 최종결정 애플 구글로 인한 보류)
router.post('/refund', requireAuth, async (ctx) => {
  const {
    body: { subscriptionId },
  } = <any>ctx.request;

  let user;

  try {
    user = await db.User.findById(ctx.state.user._id);
  } catch (error) {
    console.log(error);
    ctx.body = {
      msg: '[SERVER ERROR] : UF01',
      refundRst: false,
    };
    ctx.status = 500;
    return;
  }

  if (user) {
    const aiPointRefundLimit = 1000000 - 15;
    if (user.point < 30 || user.aiPoint < aiPointRefundLimit) {
      // NOTE: 환불정책 위배된 경우(환불정책 참고)
      ctx.body = {
        msg: '구독 후 서비스 이용 고객으로 구독 환불 불가 대상입니다.',
        refundRst: false,
      };
      ctx.status = 200;
      return;
    }

    try {
      // NOTE: 구독정보 수정
      await db.Purchase.findOneAndUpdate(
        {
          _id: subscriptionId,
        },
        {
          isExpired: true,
        }
      );
    } catch (error) {
      console.log(error);
      ctx.body = {
        msg: '[SERVER ERROR] : US01',
        refundRst: false,
      };
      ctx.status = 500;
      return;
    }

    try {
      // NOTE: 유저정보 수정
      await db.User.findOneAndUpdate(
        {
          _id: ctx.state.user._id,
        },
        {
          point: 0,
          aiPoint: 0,
        }
      );
    } catch (error) {
      console.log(error);
      ctx.body = {
        msg: '[SERVER ERROR] : UU01',
        refundRst: false,
      };
      ctx.status = 500;
      return;
    }

    ctx.body = {
      msg: '구독 환불을 완료하였습니다.',
      refundRst: true,
    };
    ctx.status = 200;
  } else {
    ctx.body = {
      msg: '유저 정보가 없습니다.',
      refundRst: false,
    };
    ctx.status = 200;
  }
});

export default router;
