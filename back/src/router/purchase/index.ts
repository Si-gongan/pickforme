import Router from '@koa/router';
import db from 'models';
import { ProductType } from 'models/product';
import requireAuth from 'middleware/jwt';
import { Receipt } from 'in-app-purchase';
import iapValidator from 'utils/iap';

const router = new Router({
  prefix: '/purchase'
});

// 포인트충전
router.post("/", requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user._id);
  if (!user) {
    return;
  }
  const { receipt, _id: productId } = <{ _id: string, receipt: Receipt }>ctx.request.body;
  const product = await db.Product.findById(productId);
  if (!product) {
    ctx.body = '존재하지 않는 상품입니다';
    ctx.status = 400;
    return;
  }
  try {
    const purchase = await iapValidator.validate(receipt, product.productId);
    if (purchase) {
      await db.Purchase.create({
        userId: ctx.state.user._id,
        product,
        purchase,
        receipt,
      });
      const { point } = product;
      user.point += point;
      await user.save();
      await db.PickHistory.create({
        usage: product.type === ProductType.SUBSCRIPTION ?  `멤버십 충전 - ${product.displayName}` : `충전 - ${product.displayName}`,
        point: user.point,
        diff: point,
        userId: user._id,
      });
      ctx.body = user.point;
      ctx.status = 200;
      return;
    }
  } catch (e) {
    ctx.body = '결제가 정상적으로 처리되지 않았습니다. 고객센터에 문의해주세요.';
    ctx.status = 400;
    return;
  }
});

// 상품목록
router.get("/products/:platform",async (ctx) => {
  const { platform } = ctx.params;
  const products = await db.Product.find({ platform });
  ctx.body = products;
  ctx.status = 200;
});

router.get('/subscription', requireAuth, async (ctx) => { 
  const subscription = await db.Purchase.findOne({ userId: ctx.state.user._id, isExpired: false });
  ctx.body = subscription;
  ctx.status = 200;
});

router.get('/history', requireAuth, async (ctx) => {
  const usages = await db.PickHistory.find({});
  ctx.body = usages;
  ctx.status = 200;
});

export default router;
