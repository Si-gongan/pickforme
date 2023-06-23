import Router from '@koa/router';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import db from 'models';
import verifyAppleToken from 'verify-apple-id-token';


const router = new Router({
  prefix: '/auth'
});

const handleLogin = async (email: string) => {
  let user = await db.User.findOne({ email });
  let isRegister = false;
  if (!user) {
    user = await db.User.create({ email, point: 3 });
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
}

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

export default router;
