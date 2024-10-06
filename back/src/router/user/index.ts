import Router from '@koa/router';
import db from 'models';
import requireAuth from 'middleware/jwt';

const router = new Router({
  prefix: '/user',
});

router.get('/my', requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user._id)
    .select('point aiPoint')
    .lean();

  if (!user) {
    ctx.status = 404;
    ctx.body = {
      error: 'User not found',
    };
    return;
  }

  ctx.body = {
    point: user.point,
    aiPoint: user.aiPoint,
  };
});

export default router;
