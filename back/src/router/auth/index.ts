import Router from '@koa/router';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import db from 'models';
import verifyAppleToken from 'verify-apple-id-token';
import requireAuth from 'middleware/jwt';
import { PushSetting } from 'models/user/types';

const router = new Router({
  prefix: '/auth'
});

const handleLogin = async (email: string) => {
  let user = await db.User.findOne({ email });
  console.log(user);
  let isRegister = false;
  if (!user) {
    user = await db.User.create({ email, point: 3 });
    isRegister = true;
  }
  const token = await user.generateToken();
  console.log(user.toObject());
  return {
    user: {
      ...user.toObject(),
      token,
    },
    isRegister,
  };
}

router.post('/google', async (ctx) => {
  const { accessToken } = <{ accessToken: string }>ctx.request.body;
  const { data } = await axios.get<{ email: string, verified_email: boolean }>(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
  const { email, verified_email } = data;
  if (
    !verified_email || 
    !email
  ) {
    ctx.body = { error: '잘못된 접근입니다'  };
    return;
  }

  ctx.body = await handleLogin(email);
});

router.post("/kakao", async (ctx) => {
  const { accessToken } = <{ accessToken: string }>ctx.request.body;
  const data = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    }
  });
  const { is_email_verified, is_email_valid, email } = (data?.data?.kakao_account || {});
  if (
    !is_email_valid ||
    !is_email_verified ||
    !email
  ) {
    ctx.body = { error: '잘못된 접근입니다'  };
    return;
  }

  ctx.body = await handleLogin(email);
});

router.post("/apple", async (ctx) => {
  const { identityToken } = <{ identityToken: string }>ctx.request.body;
  const { email_verified, email } = await verifyAppleToken({
    idToken: identityToken,
    clientId: 'com.sigonggan.pickforme',
  });
 
  if (
    !email_verified ||
    !email
  ) {
    ctx.body = { error: '잘못된 접근입니다'  };
    return;
  }
  ctx.body = await handleLogin(email);
});

router.post('/pushtoken', requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user._id);
  if (user) {
    const { token } = <{ token: string }>ctx.request.body;
    user.pushToken = token;
    await user.save();
    ctx.status = 200;
  }
});

router.put('/pushsetting', requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user._id);
  if (user) {
    user.push = <PushSetting>ctx.request.body;
    await user.save();
    ctx.body = ctx.request.body;
  }
});

export default router;
