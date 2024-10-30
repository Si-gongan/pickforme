import Router from '@koa/router';
import axios from 'axios';
import db from 'models';
import verifyAppleToken from 'verify-apple-id-token';
import requireAuth from 'middleware/jwt';
import {
  PushSetting,
} from 'models/user/types';
import {
  ProductType,
} from 'models/product';
import iapValidator from 'utils/iap';

const router = new Router({
  prefix: '/auth',
});

// 이벤트 기간 설정
const EVENT_START_DATE = new Date('2024-07-28');
const EVENT_END_DATE = new Date('2024-08-14');
const BONUS_POINTS = 5;

// NOTE: 환불 후 로그인을 위한 함수
const subscriptionCheck = async (userId: string): Promise<boolean> => {
  const subscriptions = await db.Purchase.findOne({
    userId,
    'product.type': ProductType.SUBSCRIPTION,
    isExpired: false,
  }).sort({
    createdAt: -1,
  });

  if (subscriptions) {
    if (!subscriptions.isExpired) {
      const purchaseData = await iapValidator.validate(
        subscriptions.purchase.receipt,
        subscriptions.purchase.product.productId,
      );
      if (!purchaseData) {
        subscriptions.isExpired = true;
        await subscriptions.save();
        return true;
      }
    }
  }

  return false;
};

const handleLogin = async (email: string) => {
  let user = await db.User.findOne({
    email,
  });

  let isRegister = false;
  let isNewLoginInEvent = false;

  if (!user) {
    // 신규 회원
    user = await db.User.create({
      email,
      point: 0,
      aiPoint: 15,
    });
    const usedEmail = await db.User.findOne({
      originEmail: email,
    });
    if (!usedEmail) {
      // 과거 회원 기록이 없는 경우
      // 현재 이벤트 기간에 가입한 경우
      if (new Date() > EVENT_START_DATE && new Date() < EVENT_END_DATE) {
        user.point += BONUS_POINTS;
        isNewLoginInEvent = true;
      }
    } else {
      // 과거 회원 기록이 있는 경우
      // 과거 계정의 마지막 로그인 시점이 현재와 1초 이내일 경우 업데이트 후 신규 로그인으로 처리
      const isNewLoginAfterUpdate = +new Date() - +usedEmail.lastLoginAt < 1000;
      // 과거 회원일 때 이벤트 기간 로그인 기록이 없고, 현재 이벤트 기간에 가입한 경우
      if (
        (isNewLoginAfterUpdate || usedEmail.lastLoginAt < EVENT_START_DATE)
        && new Date() > EVENT_START_DATE
        && new Date() < EVENT_END_DATE
      ) {
        user.point += BONUS_POINTS;
        isNewLoginInEvent = true;
      }
    }
    isRegister = true;
  } else {
    // 기존 회원
    // 지금 로그인 시점이 lastLoginAt과 1초 이내일 경우 업데이트 후 신규 로그인으로 처리
    const isNewLoginAfterUpdate = +new Date() - +user.lastLoginAt < 1000;
    // 이벤트 기간 내 첫 로그인 일 경우
    if (
      (isNewLoginAfterUpdate || user.lastLoginAt < EVENT_START_DATE)
      && new Date() > EVENT_START_DATE
      && new Date() < EVENT_END_DATE
    ) {
      user.point += BONUS_POINTS;
      isNewLoginInEvent = true;
    }
    // update last login date
    user.lastLoginAt = new Date();
  }

  // NOTE: 환불 후 로그인을 위한 것
  const subCheckRst = await subscriptionCheck(user._id);
  if (subCheckRst) {
    user.point = 0;
    user.aiPoint = 0;
  }

  await user.save();

  const token = await user.generateToken();
  return {
    user: {
      ...user.toObject(),
      token,
    },
    isRegister,
    isNewLoginInEvent,
  };
};

router.post('/google', async (ctx) => {
  const {
    accessToken,
  } = <{ accessToken: string }>ctx.request.body;
  const {
    data,
  } = await axios.get<{ email: string; verified_email: boolean }>(
    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}
  `,
  );
  const {
    email, verified_email,
  } = data;
  if (!verified_email || !email) {
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
  } = data?.data?.kakao_account || {};
  if (!is_email_valid || !is_email_verified || !email) {
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

  if (!email_verified || !email) {
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
