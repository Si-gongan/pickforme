import Router from '@koa/router';
import db from 'models';
import requireAuth from 'middleware/jwt';

const router = new Router({
  prefix: '/purchase'
});

// 포인트충전
router.post("/", requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user._id);
  if (!user) {
    return;
  }
  const body = <{ _id: string }>ctx.request.body;
  const product = await db.Product.findById(body._id);
  if (!product) {
    ctx.body = '존재하지 않는 상품입니다';
    ctx.status = 400;
    return;
  }
  /* 결제 넣어야함 */
  const { point } = product;
  user.point += point;
  await user.save();
  ctx.body = user.point;
  ctx.status = 200;
});

// 상품목록
router.get("/products",async (ctx) => {
  const products = await db.Product.find({});
  ctx.body = products;
  ctx.status = 200;
});

export default router;
