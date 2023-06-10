import Router from '@koa/router';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import db from 'models';
import verifyAppleToken from 'verify-apple-id-token';
import requireAuth from 'middleware/jwt';

const router = new Router({
  prefix: '/point'
});

// 포인트충전
router.post("/", requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user.userId);
  if (!user) {
    return;
  }
  /* 결제 넣어야함 */
  // ~~~
  const { point } = <{ point: number }>ctx.request.body;
  user.point += point;
  await user.save();
  ctx.body = user.point;
  ctx.status = 200;
});

export default router;
