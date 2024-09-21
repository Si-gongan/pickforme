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
  const user = await db.User.findById(ctx.state.user._id);
  if (!user) {
    return;
  }
  const { receipt, _id: productId } = <{ _id: string; receipt: Receipt }>(
    ctx.request.body
  );

  const product = await db.Product.findById(productId);
  if (!product || product.type === ProductType.PURCHASE) {
    ctx.body = '존재하지 않는 상품입니다';
    ctx.status = 400;
    return;
  }

  try {
    const purchase = await iapValidator.validate(receipt, product.productId);
    if (purchase) {
      const exist = await db.Purchase.findOne({
        userId: ctx.state.user._id,
        receipt,
      });

      if (exist) {
        ctx.body = '이미 구매한 상품입니다.';
        ctx.status = 400;
        return;
      }

      const _purchase = await db.Purchase.create({
        userId: ctx.state.user._id,
        product,
        purchase,
        receipt,
      });

      ctx.body = _purchase;
      ctx.status = 200;

      user.point += product.point;
      user.point += product.aiPoint;
      await user.save();
      return;
    }
  } catch (e) {
    ctx.body =
      '결제가 정상적으로 처리되지 않았습니다. 고객센터에 문의해주세요.';
    ctx.status = 400;
  }
});

// 상품목록
router.get('/products/:platform', async (ctx) => {
  const { platform } = ctx.params;
  const products = await db.Product.find({
    platform,
    type: ProductType.SUBSCRIPTION,
  });
  ctx.body = products;
  ctx.status = 200;
});
// 구독 여부 체크
router.get('/check', requireAuth, async (ctx) => {
  const subscription = await db.Purchase.findOne({
    userId: ctx.state.user._id,
    isExpired: false,
    'product.type': ProductType.SUBSCRIPTION,
  }).sort({ createdAt: -1 });

  const user = await db.User.findById(ctx.state.user._id);
  if (subscription === null || user === null) {
    ctx.status = 400;
    ctx.body = { error: 'Subscription or user not found' };
    return;
  }

  const oneMonthLater = new Date(subscription.createdAt);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  const now = new Date();

  if (oneMonthLater < now) {
    await subscription.updateExpiration();
    await user.processExpiredMembership();
    ctx.status = 400;
    ctx.body = { error: 'Subscription expired' };
  } else {
    const timeLeft = oneMonthLater.getTime() - now.getTime();
    const daysLeft = timeLeft / (1000 * 60 * 60 * 24);

    ctx.status = 200;
    ctx.body = {
      status: 'active',
      daysLeft: daysLeft.toFixed(2) + '일',
      expiresAt: oneMonthLater.toISOString(),
    };
  }
});

router.get('/purchases', requireAuth, async (ctx) => {
  const purchases = await db.Purchase.find({
    userId: ctx.state.user._id,
    'product.type': ProductType.PURCHASE,
  }).sort({ createdAt: -1 });
  ctx.body = purchases;
  ctx.status = 200;
});

router.get('/subscription', requireAuth, async (ctx) => {
  const subscription = await db.Purchase.findOne({
    userId: ctx.state.user._id,
    isExpired: false,
    'product.type': ProductType.SUBSCRIPTION,
  }).sort({ createdAt: -1 });
  ctx.body = subscription;
  ctx.status = 200;
});

router.get('/subscriptions', requireAuth, async (ctx) => {
  const subscriptions = await db.Purchase.find({
    userId: ctx.state.user._id,
    'product.type': ProductType.SUBSCRIPTION,
  }).sort({ createdAt: -1 });
  ctx.body = subscriptions;
  ctx.status = 200;
});

// router.get('/history', requireAuth, async (ctx) => {
//   const usages = await db.PickHistory.find({
//     userId: ctx.state.user._id,
//   });
//   ctx.body = usages;
//   ctx.status = 200;
// });

export default router;
