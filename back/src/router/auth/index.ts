import Router from '@koa/router';
import axios from 'axios';
import db from 'models';
import verifyAppleToken from 'verify-apple-id-token';
import requireAuth from 'middleware/jwt';
import {
  PushSetting,
} from 'models/user/types';

const router = new Router({
  prefix: '/auth',
});

const handleLogin = async (email: string) => {
  let user = await db.User.findOne({
    email,
  });
  let isRegister = false;
  if (!user) {
    const usedEmail = await db.User.findOne({
      originEmail: email,
    });
    user = await db.User.create({
      email, point: usedEmail ? 0 : 1,
    });
    if (!usedEmail) {
      await db.PickHistory.create({
        userId: user._id,
        diff: 1,
        point: user.point,
        usage: '회원가입 지급',
      });
    }
    isRegister = true;
  }
  const token = await user.generateToken();
  return {
    user: {
      ...user.toObject(),
      token,
    },
    isRegister,
  };
};

router.post('/google', async (ctx) => {
  const {
    accessToken,
  } = <{ accessToken: string }>ctx.request.body;
  const {
    data,
  } = await axios.get<{ email: string, verified_email: boolean }>(
    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}
  `,
  );
  const {
    email, verified_email,
  } = data;
  if (
    !verified_email
    || !email
  ) {
    ctx.body = {
      error: '잘못된 접근입니다',
    };
    return;
  }

  ctx.body = await handleLogin(email);
});

router.post('/kakao', async (ctx) => {
  const {
    accessToken,
  } = <{ accessToken: string }>ctx.request.body;
  const data = await axios.get('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const {
    is_email_verified, is_email_valid, email,
  } = (data?.data?.kakao_account || {});
  if (
    !is_email_valid
    || !is_email_verified
    || !email
  ) {
    ctx.body = {
      error: '잘못된 접근입니다',
    };
    return;
  }

  ctx.body = await handleLogin(email);
});

router.post('/apple', async (ctx) => {
  const {
    identityToken,
  } = <{ identityToken: string }>ctx.request.body;
  const {
    email_verified, email,
  } = await verifyAppleToken({
    idToken: identityToken,
    clientId: 'com.sigonggan.pickforme',
  });

  if (
    !email_verified
    || !email
  ) {
    ctx.body = {
      error: '잘못된 접근입니다',
    };
    return;
  }
  ctx.body = await handleLogin(email);
});

router.post('/pushtoken', requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user._id);
  if (user) {
    const {
      token,
    } = <{ token: string }>ctx.request.body;
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

router.post('/quit', requireAuth, async (ctx) => {
  const user = await db.User.findById(ctx.state.user._id);
  if (!user) {
    ctx.status = 404;
    return;
  }
  user.originEmail = user.email;
  user.email = `${user.email}_deleted_${new Date()}`;
  await user.save();
  ctx.status = 200;
});

export default router;
