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
  const body = <{ _id: string, receipt: Receipt }>ctx.request.body;
  const product = await db.Product.findById(body._id);
  if (!product) {
    ctx.body = '존재하지 않는 상품입니다';
    ctx.status = 400;
    return;
  }
  try {
    const validated = await iapValidator.validate(body.receipt, product._id);
    if (validated) {
      const { point } = product;
      user.point += point;
      await user.save();
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
router.get("/products",async (ctx) => {
  const products = await db.Product.find({});
  ctx.body = products;
  ctx.status = 200;
});

export default router;
