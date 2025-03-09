import Router from '@koa/router';
import db from 'models';
import requireAuth from 'middleware/jwt';
import sendPush from 'utils/push';
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



router.get('/getpoint/:id',  async (ctx) => {
  const { id } = ctx.params as {id:string};
  const user = await db.User.findById(id)
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
router.get('/push/:id',  async (ctx) => {
  const { id } = ctx.params as {id:string};
  const user = await db.User.findById(id)
    .select('pushToken')
    .lean();
  
  if (!user) {
    ctx.status = 404;
    ctx.body = {
      error: 'User not found',
    };
    return;
  }
  if (user.pushToken) {
    sendPush({
      to: user.pushToken,
      title: 'push 테스트',
      body: 'push 성공',
      data: { userId: user._id },
    });
  }
  ctx.body = {
    push : user.pushToken
  };
});


router.post('/membership', requireAuth, async (ctx) => {
  const { id, MembershipAt } = ctx.request.body as { id: string; MembershipAt: string };

  console.log(MembershipAt); // 전달받은 id 출력

  // id 값 확인
  if (!id) {
    ctx.status = 400;
    ctx.body = { error: 'User ID is required' };
    return;
  }

  // MembershipAt 값 확인
  if (!MembershipAt) {
    ctx.status = 400;
    ctx.body = { error: 'MembershipAt is required' };
    return;
  }

  // 유저 찾기
  const user = await db.User.findById(id);
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: 'User not found' };
    return;
  }
  
  // MembershipAt 값 업데이트
  user.MembershipAt = new Date(MembershipAt); // 전달받은 값을 Date 객체로 저장
  await user.save();

  ctx.body = {
    message: 'Membership date updated successfully',
    MembershipAt: user.MembershipAt,
  };

  
});

router.post('/phone', requireAuth, async (ctx) => {
  const { id, phone } = ctx.request.body as { id: string; phone: string };

  console.log(phone); // 전달받은 id 출력

  // id 값 확인
  if (!id) {
    ctx.status = 400;
    ctx.body = { error: 'User ID is required' };
    return;
  }

  // MembershipAt 값 확인
  if (!phone) {
    ctx.status = 400;
    ctx.body = { error: 'phone is required' };
    return;
  }

  // 유저 찾기
  const user = await db.User.findById(id);
  if (!user) {
    ctx.status = 404;
    ctx.body = { error: 'User not found' };
    return;
  }
  
  // MembershipAt 값 업데이트
  user.phone = phone; // 전달받은 값을 Date 객체로 저장
  await user.save();

  ctx.body = {
    message: 'Membership date updated successfully',
    phone: user.phone,
  };

  
});

export default router;