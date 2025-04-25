import Router from '@koa/router';
import db from 'models';
import { ProductType } from 'models/product';
import requireAuth from 'middleware/jwt';
import { Receipt } from 'in-app-purchase';
import iapValidator from 'utils/iap';

const router = new Router({
  prefix: '/purchase',
});

// 포인트충전
router.post('/', requireAuth, async (ctx) => {
  console.log('구매시작');
  const user = await db.User.findById(ctx.state.user._id);
  if (!user) {
    console.log('유저정보 없음');
    return;
  }

  const { receipt, _id: productId } = <{ _id: string; receipt: Receipt }>ctx.request.body;

  const product = await db.Product.findById(productId);
  if (!product || product.type === ProductType.PURCHASE) {
    console.log('상품없음', productId);
    ctx.body = '존재하지 않는 상품입니다';
    ctx.status = 400;
    return;
  }

  try {
    console.log('point', receipt, product.productId);
    const purchase = await iapValidator.validate(receipt, product.productId);
    console.log('purchase : ', purchase);
    if (purchase) {
      const exist = await db.Purchase.findOne({
        userId: ctx.state.user._id,
        receipt,
      });

      let purchaseData;

      if (exist) {
        if (!exist.isExpired) {
          console.log('이미구매한상품');
          ctx.body = '이미 구매한 상품입니다.';
          ctx.status = 400;
          return;
        }
        exist.purchase = purchase;
        exist.product = product;
        exist.receipt = receipt;
        exist.userId = ctx.state.user._id;
        exist.isExpired = false;
        purchaseData = await exist.save();
      } else {
        purchaseData = await db.Purchase.create({
          userId: ctx.state.user._id,
          product,
          purchase,
          receipt,
          isExpired: false,
        });
      }

      ctx.body = purchaseData;
      ctx.status = 200;

      user.point = 30;
      user.aiPoint = 1000000; // 무한, 부족하면 늘리기
      await user.save();
      return;
    }
    console.log('구매검증 실패');
  } catch (e) {
    console.log('결제에러', e);
    ctx.body = '결제가 정상적으로 처리되지 않았습니다. 고객센터에 문의해주세요.';
    ctx.status = 400;
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
    const subscription = await db.Purchase.findOne({
      userId: ctx.state.user._id,
      isExpired: false,
      'product.type': ProductType.SUBSCRIPTION,
    }).sort({
      createdAt: -1,
    });

    if (!subscription) {
      ctx.body = {
        subscription: null,
        activate: false,
        leftDays: 0,
        expiresAt: null,
        msg: '활성화중인 구독정보가 없습니다.',
      };
      ctx.status = 200;
      return;
    }

    // 현재 날짜와 만료일을 자정으로 맞춤
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const endDate = new Date(subscription.createdAt);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setHours(0, 0, 0, 0);

    const timeDifference = endDate.getTime() - currentDate.getTime();
    const leftDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    const activate = leftDays > 0;

    ctx.body = {
      subscription,
      activate,
      leftDays: Math.max(0, leftDays),
      expiresAt: endDate.toISOString(),
      msg: activate ? '활성화중인 구독정보를 조회하였습니다.' : '구독 기간이 만료되었습니다.',
    };
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
